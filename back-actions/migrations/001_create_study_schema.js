/**
 * Creates the initial study domain schema.
 *
 * Entities:
 * - study_area
 * - study_plan
 * - study_area_week
 * - study_record
 * - weekly_assessment
 */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createExtension('pgcrypto', {
    ifNotExists: true
  });

  pgm.createTable('study_area', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()')
    },

    name: {
      type: 'varchar(255)',
      notNull: true
    },

    weekly_goal_minutes: {
      type: 'integer',
      notNull: true
    }
  });

  pgm.addConstraint(
    'study_area',
    'study_area_weekly_goal_minutes_positive_check',
    {
      check: 'weekly_goal_minutes > 0'
    }
  );

  pgm.createTable('study_plan', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()')
    },

    name: {
      type: 'varchar(255)',
      notNull: true
    },

    coefficient: {
      type: 'numeric(5,2)',
      notNull: true
    },

    status: {
      type: 'varchar(10)',
      notNull: true
    }
  });

  pgm.addConstraint(
    'study_plan',
    'study_plan_status_check',
    {
      check: "status IN ('active', 'inactive')"
    }
  );

  pgm.createTable('study_area_week', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()')
    },

    week_start_date: {
      type: 'date',
      notNull: true
    },

    study_area_id: {
      type: 'uuid',
      notNull: true,
      references: 'study_area(id)',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    },

    study_plan_id: {
      type: 'uuid',
      notNull: true,
      references: 'study_plan(id)',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  });

  pgm.addConstraint(
    'study_area_week',
    'study_area_week_area_week_unique',
    {
      unique: ['study_area_id', 'week_start_date']
    }
  );

  pgm.createIndex(
    'study_area_week',
    ['week_start_date']
  );

  pgm.createIndex(
    'study_area_week',
    ['study_plan_id']
  );

  pgm.createTable('study_record', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()')
    },

    date: {
      type: 'date',
      notNull: true
    },

    minutes: {
      type: 'integer',
      notNull: true
    },

    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('CURRENT_TIMESTAMP')
    },

    study_area_week_id: {
      type: 'uuid',
      notNull: true,
      references: 'study_area_week(id)',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    }
  });

  pgm.addConstraint(
    'study_record',
    'study_record_minutes_positive_check',
    {
      check: 'minutes > 0'
    }
  );

  pgm.createIndex(
    'study_record',
    ['study_area_week_id']
  );

  pgm.createIndex(
    'study_record',
    ['study_area_week_id', 'created_at']
  );

  pgm.createTable('weekly_assessment', {
    id: {
      type: 'uuid',
      primaryKey: true,
      notNull: true,
      default: pgm.func('gen_random_uuid()')
    },

    study_area_week_id: {
      type: 'uuid',
      notNull: true,
      references: 'study_area_week(id)',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },

    week_goal: {
      type: 'integer',
      notNull: true
    },

    minutes_studied: {
      type: 'integer',
      notNull: true,
      default: 0
    },

    goal_achieved: {
      type: 'boolean',
      notNull: true,
      default: false
    }
  });

  pgm.addConstraint(
    'weekly_assessment',
    'weekly_assessment_week_goal_positive_check',
    {
      check: 'week_goal > 0'
    }
  );

  pgm.addConstraint(
    'weekly_assessment',
    'weekly_assessment_minutes_studied_non_negative_check',
    {
      check: 'minutes_studied >= 0'
    }
  );

  pgm.addConstraint(
    'weekly_assessment',
    'weekly_assessment_study_area_week_unique',
    {
      unique: ['study_area_week_id']
    }
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable('weekly_assessment');
  pgm.dropTable('study_record');
  pgm.dropTable('study_area_week');
  pgm.dropTable('study_plan');
  pgm.dropTable('study_area');

  pgm.dropExtension('pgcrypto', {
    ifExists: true
  });
};