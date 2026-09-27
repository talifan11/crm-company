"""
Начальная миграция — создание всех таблиц
"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('role', sa.Enum('admin', 'engineer', 'viewer', name='userrole'), nullable=False, server_default='viewer'),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Objects (инфраструктурные объекты)
    op.create_table(
        'objects',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('code', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('object_type', sa.Enum('house', 'manhole', 'coupling', 'olt', 'splitter', 'cross_box', 'substation', name='objecttype'), nullable=False),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('geometry', Geometry('POINT', srid=4326), nullable=False),
        sa.Column('parent_id', sa.Integer, sa.ForeignKey('objects.id'), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Cables (кабельные линии)
    op.create_table(
        'cables',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('code', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('cable_type', sa.Enum('optical', 'copper', 'coaxial', name='cabletype'), nullable=False),
        sa.Column('laying_method', sa.Enum('ground', 'sewer', 'aerial', 'wall', name='layingmethod'), nullable=False),
        sa.Column('length_m', sa.Float, nullable=False),
        sa.Column('from_object_id', sa.Integer, sa.ForeignKey('objects.id'), nullable=False),
        sa.Column('to_object_id', sa.Integer, sa.ForeignKey('objects.id'), nullable=False),
        sa.Column('geometry', Geometry('LINESTRING', srid=4326), nullable=False),
        sa.Column('owner', sa.String(255), nullable=True),
        sa.Column('install_date', sa.Date, nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # Attachments (вложения)
    op.create_table(
        'attachments',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('entity_type', sa.Enum('cable', 'object', name='entitytype'), nullable=False),
        sa.Column('entity_id', sa.Integer, nullable=False, index=True),
        sa.Column('file_key', sa.String(500), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('size', sa.Integer, nullable=False),
        sa.Column('uploaded_by', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('doc_category', sa.Enum('passport', 'scheme', 'approval', 'act', 'photo', 'other', name='doccategory'), nullable=False, server_default='other'),
    )

    # Audit logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('action', sa.Enum('create', 'update', 'delete', 'login', 'logout', 'upload', 'download', name='auditaction'), nullable=False),
        sa.Column('entity_type', sa.String(50), nullable=True),
        sa.Column('entity_id', sa.Integer, nullable=True),
        sa.Column('payload', sa.Text, nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # PostGIS spatial index
    op.execute("CREATE INDEX idx_cables_geometry ON cables USING GIST (geometry)")
    op.execute("CREATE INDEX idx_objects_geometry ON objects USING GIST (geometry)")


def downgrade():
    op.drop_table('audit_logs')
    op.drop_table('attachments')
    op.drop_table('cables')
    op.drop_table('objects')
    op.drop_table('users')
    # Drop enums
    op.execute("DROP TYPE IF EXISTS auditaction")
    op.execute("DROP TYPE IF EXISTS doccategory")
    op.execute("DROP TYPE IF EXISTS entitytype")
    op.execute("DROP TYPE IF EXISTS layingmethod")
    op.execute("DROP TYPE IF EXISTS cabletype")
    op.execute("DROP TYPE IF EXISTS objecttype")
    op.execute("DROP TYPE IF EXISTS userrole")
