import { OnBeforePayload } from "../../src/index";
import { parameterName, prepareDataset, prepareProxy } from "../shared/generic-strategy";
import { commonDescribe, commonIt } from "../shared/jest";

commonDescribe("<common prefix> <on before common>", () => {
  commonIt("<common prefix> <one before test name>", () => {
    const fieldValue = jest.fn();
    const args = [1, 2, 3, 4];
    const strategy = { [parameterName]: fieldValue };
    const dataset = prepareDataset({ options: { onBefore: jest.fn() } });
    const proxy = prepareProxy(strategy, dataset);

    const result = proxy[parameterName](...args);

    expect(result).toEqual(undefined);
    expect(dataset.options.onBefore).toHaveBeenCalledTimes(1);
    expect(dataset.options.onBefore).toHaveBeenCalledWith({
      fieldKey: parameterName,
      fieldValue,
      fieldValueType: typeof fieldValue,
      functionArgs: args,
    } as OnBeforePayload);
  });
});
