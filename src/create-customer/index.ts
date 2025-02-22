import * as core from '@actions/core';
import { VendorPortalApi, createCustomer } from 'replicated-lib';

import { parse } from 'yaml'

export async function actionCreateCustomer() {
  try {
    const apiToken = core.getInput("api-token", { required: true });
    const appSlug = core.getInput("app-slug", { required: true });
    const name = core.getInput("customer-name", { required: true });
    const email = core.getInput('customer-email');
    const licenseType = core.getInput("license-type") || "dev";
    const channelSlug = core.getInput('channel-slug');
    const expiresInDays: number = +(core.getInput('expires-in') || 0);
    const entitlements = core.getInput('entitlements');
    const apiEndpoint = core.getInput("replicated-api-endpoint") || process.env.REPLICATED_API_ENDPOINT;

    // The default for isKotsInstallEnabled is undefined, which means it will not be set
    // As such we can not use core.getBooleanInput
    let isKotsInstallEnabled: boolean | undefined = undefined;
    if (core.getInput("is-kots-install-enabled") !== "") {
      isKotsInstallEnabled =
        core.getInput("is-kots-install-enabled") === "true";
    }

    let isDevModeEnabled: boolean | undefined = undefined;
    if (core.getInput("is-dev-mode-enabled") !== "") {
      isDevModeEnabled =
        core.getInput("is-dev-mode-enabled") === "true";
    }
    
    const apiClient = new VendorPortalApi();
    apiClient.apiToken = apiToken;

    if (apiEndpoint) {
      apiClient.endpoint = apiEndpoint
    }

    const entitlementsArray = processEntitlements(entitlements)
    const customer = await createCustomer(apiClient, appSlug, name, email, licenseType, channelSlug, expiresInDays, entitlementsArray, isKotsInstallEnabled, isDevModeEnabled);

    core.setOutput('customer-id', customer.customerId);
    core.setOutput('license-id', customer.licenseId);
    core.setOutput('license-file', customer.license);

  } catch (error) {
    core.setFailed(error.message);
  }
}

function processEntitlements(entitlements: string): [] | undefined {
  if (entitlements) {
    const entitlementsYAML = parse(entitlements)
    
    // for each entitlement in entitlementsYAML, convert to json and add to array
    const entitlementsArray = entitlementsYAML.map((entitlement: any) => {
      return {name: entitlement.name, value: entitlement.value}
    })
    return entitlementsArray
  }
  return undefined
}
