/**
 * Adds the positive coefficient constraint to StudyPlan.
 *
 * Rule:
 * StudyPlan.coefficient must be greater than zero.
 */

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.addConstraint(
    'study_plan',
    'study_plan_coefficient_positive_check',
    {
      check: 'coefficient > 0'
    }
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropConstraint(
    'study_plan',
    'study_plan_coefficient_positive_check'
  );
};