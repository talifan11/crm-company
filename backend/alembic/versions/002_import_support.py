"""
Миграция: добавление полей для поддержки импорта
- import_batch_id для отслеживания пакетов импорта
- imported_at timestamp
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Добавляем поля для отслеживания импорта в cables
    op.add_column('cables', sa.Column('import_batch_id', sa.String(36), nullable=True))
    op.add_column('cables', sa.Column('imported_at', sa.DateTime(timezone=True), nullable=True))
    
    # Добавляем поля для отслеживания импорта в objects
    op.add_column('objects', sa.Column('import_batch_id', sa.String(36), nullable=True))
    op.add_column('objects', sa.Column('imported_at', sa.DateTime(timezone=True), nullable=True))
    
    # Индексы для быстрого поиска по batch
    op.create_index('idx_cables_import_batch', 'cables', ['import_batch_id'])
    op.create_index('idx_objects_import_batch', 'objects', ['import_batch_id'])


def downgrade():
    op.drop_index('idx_objects_import_batch', 'objects')
    op.drop_index('idx_cables_import_batch', 'cables')
    op.drop_column('objects', 'imported_at')
    op.drop_column('objects', 'import_batch_id')
    op.drop_column('cables', 'imported_at')
    op.drop_column('cables', 'import_batch_id')
