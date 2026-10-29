import CrudPage from '../components/CrudPage';
import { useAuth } from '../AuthContext';
import { useLang } from '../i18n';
import { fmtDate } from '../api';

const farmRef = { type: 'select', ref: '/farms', refLabel: 'name' };

export function Farms() {
  const { t } = useLang();
  return (
    <CrudPage
      title={t('farms')}
      endpoint="/farms"
      hint="Add your village and state - coordinates are looked up automatically so weather works. You can also enter latitude/longitude manually."
      fields={[
        { name: 'name', label: 'Farm name', required: true },
        { name: 'village', label: 'Village / town' },
        { name: 'state', label: 'State' },
        { name: 'areaAcres', label: 'Area (acres)', type: 'number', min: 0 },
        { name: 'soilType', label: 'Soil type', type: 'select', options: ['Loamy', 'Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay'] },
        { name: 'waterSource', label: 'Water source', type: 'select', options: ['Rainfed', 'Canal', 'Borewell', 'Well', 'River', 'Drip'] },
        { name: 'lat', label: 'Latitude (optional)', type: 'number' },
        { name: 'lon', label: 'Longitude (optional)', type: 'number' },
      ]}
      columns={[
        { key: 'name', label: 'Farm' },
        { key: 'loc', label: 'Location', render: (r) => [r.village, r.state].filter(Boolean).join(', ') || '-' },
        { key: 'areaAcres', label: 'Acres' },
        { key: 'soilType', label: 'Soil' },
        { key: 'waterSource', label: 'Water' },
      ]}
    />
  );
}

const statusColor = { Planned: 'secondary', Growing: 'success', Harvested: 'primary' };

export function Crops() {
  const { t } = useLang();
  return (
    <CrudPage
      title={t('crops')}
      endpoint="/crops"
      fields={[
        { name: 'farm', label: 'Farm', required: true, ...farmRef },
        { name: 'name', label: 'Crop', required: true },
        { name: 'variety', label: 'Variety' },
        { name: 'areaAcres', label: 'Area (acres)', type: 'number', min: 0 },
        { name: 'status', label: 'Status', type: 'select', options: ['Planned', 'Growing', 'Harvested'] },
        { name: 'sowingDate', label: 'Sowing date', type: 'date' },
        { name: 'expectedHarvest', label: 'Expected harvest', type: 'date' },
        { name: 'yieldKg', label: 'Yield (kg)', type: 'number', min: 0 },
        { name: 'notes', label: 'Notes / activity log', type: 'textarea' },
      ]}
      columns={[
        { key: 'name', label: 'Crop', render: (r) => <><b>{r.name}</b><div className="small text-muted">{r.variety}</div></> },
        { key: 'farm', label: 'Farm', render: (r) => r.farm?.name || '-' },
        { key: 'status', label: 'Status', render: (r) => <span className={`badge bg-${statusColor[r.status]}`}>{r.status}</span> },
        { key: 'sowingDate', label: 'Sown', render: (r) => fmtDate(r.sowingDate) },
        { key: 'expectedHarvest', label: 'Harvest', render: (r) => fmtDate(r.expectedHarvest) },
        { key: 'yieldKg', label: 'Yield (kg)' },
      ]}
    />
  );
}

export function Soil() {
  const { t } = useLang();
  const color = { Good: 'success', Moderate: 'warning', Poor: 'danger' };
  return (
    <CrudPage
      title={t('soil')}
      endpoint="/soil"
      hint="Enter your lab or test-kit values. N, P, K in kg/ha; moisture and organic matter in %."
      fields={[
        { name: 'farm', label: 'Farm', required: true, ...farmRef },
        { name: 'date', label: 'Test date', type: 'date' },
        { name: 'ph', label: 'pH (0-14)', type: 'number', required: true, min: 0, max: 14 },
        { name: 'nitrogen', label: 'Nitrogen (kg/ha)', type: 'number', min: 0 },
        { name: 'phosphorus', label: 'Phosphorus (kg/ha)', type: 'number', min: 0 },
        { name: 'potassium', label: 'Potassium (kg/ha)', type: 'number', min: 0 },
        { name: 'moisture', label: 'Moisture (%)', type: 'number', min: 0, max: 100 },
        { name: 'organicMatter', label: 'Organic matter (%)', type: 'number', min: 0, max: 100 },
      ]}
      columns={[
        { key: 'farm', label: 'Farm', render: (r) => r.farm?.name || '-' },
        { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
        { key: 'ph', label: 'pH' },
        { key: 'npk', label: 'N-P-K', render: (r) => [r.nitrogen, r.phosphorus, r.potassium].map((v) => v ?? '-').join(' - ') },
        { key: 'moisture', label: 'Moist.%' },
        { key: 'score', label: 'Health', render: (r) => <span className={`badge bg-${color[r.analysis?.rating]}`}>{r.analysis?.score} - {r.analysis?.rating}</span> },
        { key: 'advice', label: 'Advice', render: (r) => <ul className="small mb-0 ps-3">{r.analysis?.recommendations.map((x) => <li key={x}>{x}</li>)}</ul> },
      ]}
    />
  );
}

export const alertFields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'crop', label: 'Crop(s)' },
  { name: 'region', label: 'Region' },
  { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Medium', 'High'] },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'prevention', label: 'Prevention / treatment', type: 'textarea' },
];
export const alertColumns = [
  { key: 'severity', label: 'Level', render: (r) => <span className={`badge badge-${r.severity}`}>{r.severity}</span> },
  { key: 'title', label: 'Alert', render: (r) => <><b>{r.title}</b><div className="small text-muted">{r.crop} {r.region && `- ${r.region}`}</div></> },
  { key: 'description', label: 'Details' },
  { key: 'prevention', label: 'Prevention' },
];

export function Alerts() {
  const { t } = useLang();
  const { user } = useAuth();
  return <CrudPage title={t('alerts')} endpoint="/alerts" canWrite={user?.role === 'admin'} fields={alertFields} columns={alertColumns} hint="Live weather-based risk advisories are shown on the Weather page." />;
}
