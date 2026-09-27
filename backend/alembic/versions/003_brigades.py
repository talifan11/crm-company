"""
Миграция: Бригады и персонал (Шаг 1)
- coverage_zones (заглушка для Шага 5)
- brigades
- brigade_shifts
- brigade_locations
"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Coverage zones (заглушка)
    op.create_table(
        'coverage_zones',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('zone_type', sa.Enum('service_area', 'brigade_area', 'planned_build', 
                                       'competitor_area', 'problem_area', name='zonetype'), nullable=False),
        sa.Column('geometry', Geometry('POLYGON', srid=4326), nullable=False),
        sa.Column('status', sa.String(50), server_default='active'),
        sa.Column('color_override', sa.String(7), nullable=True),
        sa.Column('brigade_id', sa.Integer, sa.ForeignKey('brigades.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.execute("CREATE INDEX idx_coverage_zones_geometry ON coverage_zones USING GIST (geometry)")

    # Brigades
    op.create_table(
        'brigades',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('lead_user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('member_ids', sa.ARRAY(sa.Integer), nullable=False, server_default='{}'),
        sa.Column('zone_id', sa.Integer, sa.ForeignKey('coverage_zones.id'), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('vehicle', sa.String(100), nullable=True),
        sa.Column('status', sa.Enum('active', 'on_ticket', 'en_route', 'day_off', 'inactive', 
                                     name='brigadestatus'), nullable=False, server_default='active'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_brigades_status', 'brigades', ['status'])

    # Brigade shifts
    op.create_table(
        'brigade_shifts',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('brigade_id', sa.Integer, sa.ForeignKey('brigades.id'), nullable=False),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('started', 'active', 'paused', 'ended', 
                                     name='shiftstatus'), nullable=False, server_default='started'),
        sa.Column('geo_start', Geometry('POINT', srid=4326), nullable=True),
        sa.Column('geo_end', Geometry('POINT', srid=4326), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_brigade_shifts_brigade', 'brigade_shifts', ['brigade_id'])
    op.create_index('idx_brigade_shifts_status', 'brigade_shifts', ['status'])

    # Brigade locations
    op.create_table(
        'brigade_locations',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('brigade_id', sa.Integer, sa.ForeignKey('brigades.id'), nullable=False),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('geometry', Geometry('POINT', srid=4326), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('source', sa.String(50), nullable=True),
        sa.Column('accuracy', sa.Float, nullable=True),
        sa.Column('speed', sa.Float, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_brigade_locations_brigade', 'brigade_locations', ['brigade_id'])
    op.create_index('idx_brigade_locations_recorded', 'brigade_locations', ['recorded_at'])
    op.execute("CREATE INDEX idx_brigade_locations_geometry ON brigade_locations USING GIST (geometry)")


def downgrade():
    op.drop_table('brigade_locations')
    op.drop_table('brigade_shifts')
    op.drop_table('brigades')
    op.drop_table('coverage_zones')
    op.execute("DROP TYPE IF EXISTS zonetype")
    op.execute("DROP TYPE IF EXISTS brigadestatus")
    op.execute("DROP TYPE IF EXISTS shiftstatus")
