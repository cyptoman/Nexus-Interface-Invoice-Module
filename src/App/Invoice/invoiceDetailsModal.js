//Internal Dependencies
import { formatDateTime } from 'gui/intl';

import { loadInvoices, OpenPopUp, ClosePopUp } from 'lib/ui';

import AccountAsk from 'component/AccountAsk';

const {
  libraries: {
    React,
    React: { Component },
    ReactRedux: { connect },
    emotion: { styled },
  },
  components: {
    GlobalStyles,
    Icon,
    Modal,
    Panel,
    Switch,
    Tooltip,
    Select,
    TextField,
    FormField,
    Button,
    Arrow,
  },
  utilities: {
    confirm,
    color,
    apiCall,
    sendNXS,
    secureApiCall,
    showErrorDialog,
    showSuccessDialog,
  },
} = NEXUS;

const __ = (input) => input;

const timeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

const ModalInternal = styled(Modal)({ maxHeight: '90%' });

const HeaderSubtext = styled.div({
  fontSize: '75%',
});

const Row = styled.div({
  display: 'grid',
  gridTemplateAreas: '"label value"',
  gridTemplateColumns: '1fr 2fr',
  alignItems: 'start',
  columnGap: '1em',
  marginBottom: '.6em',
});

const Label = styled.div(({ theme }) => ({
  gridArea: 'label',
  textAlign: 'right',
  color: theme.mixer(0.875),
}));

const Value = styled.div({
  gridArea: 'value',
  wordBreak: 'break-word',
});

const Field = ({ label, children }) => (
  <Row>
    <Label>{label}</Label>
    <Value>{children}</Value>
  </Row>
);

const CenterValue = styled.div(({ theme }) => ({
  color: theme.mixer(0.875),
  textAlign: 'center',
}));
const LeftBorderDiv = styled.div(({ theme }) => ({
  borderLeft: `1px solid ${theme.primary}`,
  marginTop: '-1em',
  paddingTop: '1em',
  paddingLeft: '2px',
}));

const TableHeader = styled.div(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto 8em 5em 10em',
  gridTemplateRows: 'auto',
  gridGap: '1em 1em',
}));

const TableHeaderText = styled(LeftBorderDiv)(
  ({ theme, padding }) => ({
    paddingRight: `${padding}em`,
    marginRight: `-${padding}em`,
    backgroundColor: color.darken(theme.background, 0.75),
    borderBottom: `1px solid ${theme.foreground}`,
  }),
  ({ border }) =>
    border ? { borderLeft: 'none', paddingLeft: '5px', marginLeft: '-4px' } : {}
);

const ItemsContainter = styled.div(({ theme }) => ({
  padding: '1em 0em 0em 0.25em',
  border: `2px solid ${theme.primary}`,
  borderRadius: '5px',
  backgroundColor: color.darken(theme.background, 0.5),
}));
const InvoiceItem = ({ description, unit_amount, units, itemTotal }) => (
  <>
    <div>{description}</div>
    <LeftBorderDiv>{unit_amount}</LeftBorderDiv>
    <LeftBorderDiv>{units}</LeftBorderDiv>
    <LeftBorderDiv>{itemTotal}</LeftBorderDiv>
  </>
);

const InvoiceItems = ({ items }) => {
  return (
    <ItemsContainter>
      <TableHeader>
        {' '}
        <TableHeaderText padding={1} border={'none'}>
          {'Description'}
        </TableHeaderText>
        <TableHeaderText padding={2}>{'Price'}</TableHeaderText>
        <TableHeaderText padding={2}>{'Quantity'}</TableHeaderText>
        <TableHeaderText padding={0}>{'Total'}</TableHeaderText>
        {items.map((e) => (
          <InvoiceItem
            description={e.description}
            unit_amount={e.unit_amount}
            units={e.units}
            itemTotal={e.unit_amount * e.units}
          />
        ))}
      </TableHeader>
    </ItemsContainter>
  );
};

const StatusTag = styled.div(
  {
    width: '10em',
    height: '10em',
    position: 'absolute',
    top: '-80px',
    borderRight: '70px solid transparent',
    transform: 'skew(0deg, -45deg)',
    '& > h2': {
      position: 'absolute',
      top: '85px',
      left: '0px',
      color: 'dimgray',
      mixBlendMode: 'screen',
      transform: 'skew(0deg, 45deg) rotate(-45deg)',
    },
  },

  ({ theme, status }) => {
    switch (status) {
      case 'OUTSTANDING':
        return {
          borderBottom: `70px solid ${theme.background}`,
          '& > h2': {
            top: '90px',
            fontSize: '1.25em',
            left: '-15px',
          },
        };
      case 'CANCELLED':
        return {
          borderBottom: `70px solid ${theme.danger}`,
          '& > h2': { left: '-5px' },
        };
      case 'PAID':
        return {
          borderBottom: `70px solid ${theme.primary}`,
          '& > h2': { left: '35px' },
        };
      default:
        return { borderBottom: `70px solid ${theme.background}` };
    }
  }
);

const PastDueText = styled.a(({ theme }) => ({
  color: theme.danger,
}));

const OptionsArrow = styled.span({
  display: 'inline-block',
  width: 15,
  verticalAlign: 'middle',
});

const MoreOpenButton = (moreOpen, moreOpenToggle, children) => (
  <>
    {moreOpen && children}
    <Button
      onClick={moreOpenToggle}
      skin="hyperlink"
      style={{
        width: '12px',
        height: '10px',
        gridRowStart: 3,
        borderBottomStyle: 'none',
        paddingBottom: '1em',
      }}
    >
      <OptionsArrow>
        <Arrow direction={moreOpen ? 'down' : 'right'} height={8} width={10} />
      </OptionsArrow>
      <span className="v-align">
        {__(moreOpen ? __('Less Details') : __('More Details'))}
      </span>
    </Button>
  </>
);

//Allow support any addtional key/values that may be attached to the invoice
const AdditionalKeyValues = (addValues) =>
  addValues.map((e) => <Field label={e.key}>{e.value}</Field>);
const testhh = () => <div>test</div>;

class InvoiceDetailModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moreOpen: false,
    };
  }

  componentDidMount() {}

  calculateTotal = (items) =>
    items.reduce((total, element) => {
      return total + element.units * element.unit_amount;
    }, 0);

  clickPayNow = async (e) => {
    this.props.OpenPopUp(AccountAsk, { invoice: this.props.invoice });
  };

  clickCancel = async (e) => {
    const result = await confirm({
      question: __('Are you sure you want to cancel this invoice?'),
      note: __(''),
    });

    if (result) {
      const params = {
        address: this.props.invoice.address,
      };

      try {
        const result = await secureApiCall('invoices/cancel/invoice', params);
        console.log(result);
        if (result) {
          this.props.loadInvoices();
          this.props.ClosePopUp();
        }
      } catch (error) {
        //show error
        console.error(error);
      }
    }
  };

  isPastDue() {
    const { dueDate } = this.props.invoice;
    if (Date.now() > dueDate) {
      return true;
    } else {
      return false;
    }
  }

  toggleMoreOpen = (e) => {
    this.setState({
      moreOpen: !this.state.moreOpen,
    });
  };

  returnRest(rest) {
    return Object.keys(rest).map((e) => {
      return { key: e, value: rest[e] };
    });
  }
  render() {
    console.log(this.props);
    const {
      description,
      created,
      reference,
      invoiceNumber,
      due_date,
      account,
      amount,
      address,
      sender_detail,
      recipient,
      recipient_detail,
      status,
      paidOn,
      items,
      ...rest
    } = this.props.invoice;
    const { isMine } = this.props;
    const pastDue = this.isPastDue();
    console.log(rest);
    console.log(this.isPastDue());
    this.calculateTotal(items);
    console.log(items);
    return (
      <ModalInternal
        removeModal={this.props.removeModal}
        assignClose={(closeModal) => (this.closeModal = closeModal)}
      >
        <StatusTag status={status}>
          <h2>{status}</h2>
        </StatusTag>
        <Modal.Header>
          {'Invoice'}
          <HeaderSubtext>{description}</HeaderSubtext>
        </Modal.Header>
        <Modal.Body style={{ overflowX: 'hidden' }}>
          <Field label={__('Created')}>
            {' '}
            {formatDateTime(created * 1000, timeFormatOptions)}{' '}
          </Field>
          {reference && <Field label={__('Reference')}>{reference}</Field>}
          {invoiceNumber && (
            <Field label={__('Invoice Number')}>{invoiceNumber}</Field>
          )}
          {due_date && (
            <Field label={__('Due Date')}>
              {pastDue ? (
                <Tooltip.Trigger
                  tooltip={__('Warning, Past Due!')}
                  position={'top'}
                >
                  <PastDueText>
                    {formatDateTime(due_date * 1000, timeFormatOptions)}
                  </PastDueText>
                </Tooltip.Trigger>
              ) : (
                formatDateTime(due_date * 1000, timeFormatOptions)
              )}
            </Field>
          )}
          <Field label={__('Account Payable')}>{account}</Field>
          <Field label={__('Address of Invoice')}>{address}</Field>
          {sender_detail && (
            <Field label={__('Details')}>{sender_detail}</Field>
          )}
          <Field label={__('Recipient')}>{recipient}</Field>
          {recipient_detail && (
            <Field label={__('Details')}>{recipient_detail}</Field>
          )}
          <Field label={__('Status')}>{status}</Field>
          {paidOn && (
            <Field label={__('Paid On')}>
              {formatDateTime(paidOn, timeFormatOptions)}
            </Field>
          )}
          <Field label={__('Total')}>{`${amount} NXS`}</Field>
          {MoreOpenButton(
            this.state.moreOpen || false,
            this.toggleMoreOpen,
            AdditionalKeyValues(this.returnRest(rest))
          )}
          <CenterValue>{__('Items')}</CenterValue>
          {items && <InvoiceItems items={items} />}
        </Modal.Body>
        <Modal.Footer>
          {isMine ? (
            <div
              className="mt2 flex space-between"
              style={{ marginBottom: '1em' }}
            >
              <Button skin="primary" onClick={() => this.closeModal()}>
                {'Close'}
              </Button>
              {status === 'OUTSTANDING' && (
                <Button skin="primary" onClick={this.clickPayNow}>
                  {'Pay'}
                </Button>
              )}
            </div>
          ) : (
            <div
              className="mt2 flex space-between"
              style={{ marginBottom: '1em' }}
            >
              <Button skin="primary" onClick={() => this.closeModal()}>
                {'Close'}
              </Button>
              {status === 'OUTSTANDING' && (
                <Tooltip.Trigger
                  tooltip={__(
                    'Cancel this invoice, preventing the recipient from paying it.'
                  )}
                  position={'top'}
                >
                  <Button skin="danger" onClick={this.clickCancel}>
                    {'Cancel'}
                  </Button>
                </Tooltip.Trigger>
              )}
              {status === 'Draft' && (
                <Button skin="danger" onClick={this.deleteDraft}>
                  {'Delete Draft'}
                </Button>
              )}
            </div>
          )}
        </Modal.Footer>
      </ModalInternal>
    );
  }
}
const mapStateToProps = (state) => {
  return { username: state.user.username };
};

export default connect(mapStateToProps, {
  loadInvoices,
  ClosePopUp,
  OpenPopUp,
})(InvoiceDetailModal);
