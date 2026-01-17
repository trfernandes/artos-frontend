export enum OrderDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum Operator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  LIKE = 'like',
  ILIKE = 'ilike',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}

export enum ValueType {
  LITERAL = 'literal',
  FIELD = 'field',
}

export enum Conjunction {
  AND = 'AND',
  OR = 'OR',
}

export interface LiteralValue {
  type: ValueType.LITERAL;
  value: string;
}

export interface FieldValue {
  type: ValueType.FIELD;
  path: string;
}

export interface ConditionValue {
  type: ValueType;
  value?: any;
  path?: string;
}

export interface SimpleCondition {
  path: string;
  operator: Operator;
  value: LiteralValue | FieldValue;
}

export interface ComplexCondition {
  conjunction: Conjunction;
  conditions: Condition[];
}

export type Condition = SimpleCondition | ComplexCondition;

export interface WhereClause {
  conditions: Condition[];
  conjunction?: Conjunction;
}

export interface OrderByClause {
  path: string;
  direction: OrderDirection;
}

export interface DynamicQuery {
  where?: WhereClause;
  orderBy?: OrderByClause[];
  limit?: number;
  relations?: string[];
  skip?: number;
}
