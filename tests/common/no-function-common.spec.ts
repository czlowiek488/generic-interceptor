import { OnNonFunctionPayload } from "../../src/index";
import { parameterName, prepareDataset, prepareProxy } from "../shared/generic-strategy";
import { commonDescribe, commonIt } from "../shared/jest";

commonDescribe("<common prefix> <no function common>", () => {
  commonIt("<common prefix> <get no functional property test name>", () => {
    const strategyInput = { [parameterName]: "value" };
    const dataset = prepareDataset({ options: { onNonFunction: jest.fn() } });
    const proxy = prepareProxy(dataset, strategyInput);

    expect(proxy[parameterName]).toEqual(strategyInput[parameterName]);
    expect(dataset.options.onNonFunction).toHaveBeenCalledTimes(1);
    expect(dataset.options.onNonFunction).toHaveBeenCalledWith({
      fieldKey: parameterName,
      fieldValueType: typeof proxy[parameterName],
    } as OnNonFunctionPayload);
  });
});
