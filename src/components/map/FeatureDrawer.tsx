/**
 * Drawer (боковая панель) с информацией о выбранном объекте/кабеле
 */
import { X, Download, FileText, MapPin, Calendar, Ruler, User } from 'lucide-react';
import { useMapStore } from '../../stores/mapStore';
import { mockCables, mockObjects, CABLE_TYPE_LABELS, LAYING_METHOD_LABELS, OBJECT_TYPE_LABELS, DOC_CATEGORY_LABELS, OBJECT_COLORS } from '../../data/mockData';
import type { Cable, InfraObject, Attachment } from '../../types';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' Б';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
  return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
}

export default function FeatureDrawer() {
  const { selectedFeature, drawerOpen, setDrawerOpen, setSelectedFeature } = useMapStore();

  if (!drawerOpen || !selectedFeature) return null;

  const close = () => {
    setDrawerOpen(false);
    setSelectedFeature(null);
  };

  let cable: Cable | undefined;
  let obj: InfraObject | undefined;

  if (selectedFeature.type === 'cable') {
    cable = mockCables.find((c) => c.id === selectedFeature.id);
  } else {
    obj = mockObjects.find((o) => o.id === selectedFeature.id);
  }

  const attachments = cable?.attachments || obj?.attachments || [];

  return (
    <div
      className="absolute top-0 right-0 h-full w-96 overflow-y-auto z-50"
      style={{ background: 'var(--color-bg-elevated)', borderLeft: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)' }}
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b" style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-border)' }}>
        <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {cable ? 'Кабель' : 'Объект'}
        </h2>
        <button onClick={close} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {cable && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Код</p>
              <p className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>{cable.code}</p>
            </div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{cable.name}</h3>
            
            <div className="space-y-3">
              <InfoRow icon={<Ruler className="w-3.5 h-3.5" />} label="Длина" value={`${cable.length_m} м`} />
              <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label="Тип" value={CABLE_TYPE_LABELS[cable.cable_type]} />
              <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Прокладка" value={LAYING_METHOD_LABELS[cable.laying_method]} />
              <InfoRow icon={<User className="w-3.5 h-3.5" />} label="Владелец" value={cable.owner || '—'} />
              <InfoRow icon={<Calendar className="w-3.5 h-3.5" />} label="Дата монтажа" value={cable.install_date || '—'} />
            </div>

            {cable.notes && (
              <div className="p-3 rounded-md text-sm" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                {cable.notes}
              </div>
            )}
          </div>
        )}

        {obj && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: OBJECT_COLORS[obj.object_type] }} />
              <p className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>{obj.code}</p>
            </div>
            <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>{obj.name}</h3>
            
            <div className="space-y-3">
              <InfoRow icon={<FileText className="w-3.5 h-3.5" />} label="Тип" value={OBJECT_TYPE_LABELS[obj.object_type]} />
              {obj.address && <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Адрес" value={obj.address} />}
            </div>

            {obj.notes && (
              <div className="p-3 rounded-md text-sm" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>
                {obj.notes}
              </div>
            )}
          </div>
        )}

        {/* Документы */}
        <div className="pt-5 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            <FileText className="w-3.5 h-3.5" />
            Документы ({attachments.length})
          </h4>
          
          {attachments.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Нет прикреплённых документов</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((att) => (
                <AttachmentItem key={att.id} attachment={att} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
      </div>
    </div>
  );
}

function AttachmentItem({ attachment }: { attachment: Attachment }) {
  return (
    <div
      className="flex items-center justify-between p-2.5 rounded-md transition-colors"
      style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{attachment.filename}</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {DOC_CATEGORY_LABELS[attachment.doc_category]} · {formatFileSize(attachment.size)}
          </p>
        </div>
      </div>
      <button
        className="p-1.5 rounded flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{ color: 'var(--color-accent)' }}
        title="Скачать"
        onClick={() => alert('В проде: скачивание по presigned URL из MinIO')}
      >
        <Download className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
