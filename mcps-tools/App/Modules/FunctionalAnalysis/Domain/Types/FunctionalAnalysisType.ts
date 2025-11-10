export type FunctionalAnalysisType = {
    title: string;
    businessContext: string;
    functionalScope: string;
    businessRules: string[];
    acceptanceCriteria: AcceptanceCriterionType[];
    entities: EntityType[];
    nonFunctionalRequirements: string[];
};

export type AcceptanceCriterionType = {
    id: string;
    given: string;
    when: string;
    then: string;
};

export type EntityType = {
    name: string;
    description: string;
    attributes: string[];
};
