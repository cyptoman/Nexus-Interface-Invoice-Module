import {
  setInvoiceReferenceQuery,
  setInvoiceStatusFilter,
  setInvoiceTimeFilter,
} from 'lib/ui';

const {
  libraries: {
    React,
    ReactRedux: { connect },
    emotion: { styled },
  },
  components: {
    GlobalStyles,
    Panel,
    Switch,
    Tooltip,
    Select,
    TextField,
    FormField,
    Button,
  },
  utilities: {
    confirm,
      
    showErrorDialog,
    showSuccessDialog,
  },
} = NEXUS;

__ = __context('Transactions');

const operations = ['PENDING', 'PAID', 'REJECTED'];

const opOptions = [
  {
    value: null,
    display: __('All'),
  },
  ...operations.map(op => ({
    value: op,
    display: op,
  })),
];

const timeFrames = [
  {
    value: null,
    display: __('All'),
  },
  {
    value: 'year',
    display: __('Past Year'),
  },
  {
    value: 'month',
    display: __('Past Month'),
  },
  {
    value: 'week',
    display: __('Past Week'),
  },
];

const FiltersWrapper = styled.div(({ morePadding }) => ({
  gridArea: 'filters',
  display: 'grid',
  gridTemplateAreas: '"reference timeFrame operation"',
  gridTemplateColumns: '3fr 2fr 100px auto',
  gridRowStart: 1,
  gridRowEnd: 1,
  columnGap: '.75em',
  alignItems: 'end',
  fontSize: 15,
  padding: `0 0 10px 0`,
}));

const MoreOptions = styled.div({
  paddingLeft: '1em',
  display: 'grid',
  gridTemplateColumns: 'auto auto auto auto',
  gridRowStart: 2,
  gridColumnStart: 1,
  gridColumnEnd: 4,
  columnGap: '.75em',
  alignItems: 'end',
});

const Filters = ({
  referenceQuery,
  status,
  timeSpan,
  morePadding,
  children,
  optionsOpen,
}) => (
  <FiltersWrapper>
    <FormField connectLabel label={__('Reference')}>
      <TextField
        type="search"
        placeholder="Reference Search"
        value={referenceQuery}
        onChange={evt => setInvoiceReferenceQuery(evt.target.value)}
      />
    </FormField>

    <FormField label={__('Time span')}>
      <Select
        value={timeSpan}
        onChange={setInvoiceTimeFilter}
        options={timeFrames}
      />
    </FormField>

    <FormField label={__('Status')}>
      <Select
        value={status}
        onChange={setInvoiceStatusFilter}
        options={opOptions}
      />
    </FormField>

    {children}
    {optionsOpen && (
      <MoreOptions>
        <FormField label={__('Description')}>
          <TextField type="search" placeholder="Description Search" />
        </FormField>

        <FormField label={__('Show Only PastDue')}>
          <Switch />
        </FormField>

        <FormField label={__('Payable')}>
          <TextField type="search" placeholder="Search Payable" />
        </FormField>
        <FormField label={__('Receipiant')}>
          <TextField type="search" placeholder="Search Receipiant" />
        </FormField>
      </MoreOptions>
    )}
  </FiltersWrapper>
);

const mapStateToProps = ({
  ui: {
    invoices: { referenceQuery, status, timeSpan },
  },
}) => ({
  referenceQuery,
  status,
  timeSpan,
});

export default connect(mapStateToProps)(Filters);
