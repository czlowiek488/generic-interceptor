import { OnNonFunctionPayload } from "../../src/index";
import { parameterName, prepareDataset, prepareProxy } from "../shared/generic-strategy";
import { commonDescribe, commonIt } from "../shared/jest";

commonDescribe("<common prefix> <no function common>", () => {
  commonIt("<common prefix> <get no functional property test name>", () => {
    const fieldValue = "value";
    const strategy = { [parameterName]: fieldValue };
    const dataset = prepareDataset({ options: { onNonFunction: jest.fn() } });
    const proxy = prepareProxy(strategy, dataset);

    const result = proxy[parameterName];

    expect(result).toEqual(fieldValue);
    expect(dataset.options.onNonFunction).toHaveBeenCalledTimes(1);
    expect(dataset.options.onNonFunction).toHaveBeenCalledWith({
      fieldKey: parameterName,
      fieldValue,
      fieldValueType: typeof fieldValue,
    } as OnNonFunctionPayload);
  });
});
