# Compatibility Actions

## Examples

### Development

The development workflow will run the workflow on every push to a branch that is not the main branch. It will create a new release that is promoted to a channel with the same name as the branch.
The next job will setup a compatibility matrix of clusters, deploy the app and execute some tests. Once everything is successful the created clusters and customers will be removed again.
Based on your preference you can either use the simplified prepare-cluster version, or the highly customizable version.

#### Prepare Cluster

See the [example workflow](example-workflows/development-helm-prepare-cluster.yaml) for more details and also the [prepare-cluster](prepare-cluster) directory for the actual action.

https://github.com/replicatedhq/replicated-actions/blob/71c3cdf8e9b72754fdad6394238d5f872c1b8c65/example-workflows/development-helm-prepare-cluster.yaml#L1-L35

#### Customizable

##### Installation with Helm

See the [example workflow](example-workflows/development-helm.yaml) for more details.

https://github.com/replicatedhq/replicated-actions/blob/71c3cdf8e9b72754fdad6394238d5f872c1b8c65/example-workflows/development-helm.yaml#L1-L140

##### Installation with KOTS

See the [example workflow](example-workflows/development-kots.yaml) for more details.

https://github.com/replicatedhq/replicated-actions/blob/71c3cdf8e9b72754fdad6394238d5f872c1b8c65/example-workflows/development-kots.yaml#L1-L133

### Releasing

The releasing workflow will run the workflow each time a tag is being placed on the repository. It will create a new release that is promoted to a channel with the same name as the tag.
The next job will setup a compatibility matrix of clusters, deploy the app and execute some tests. Once everything is successful the release will be promoted to the stable channel. And the created clusters and customers for the compatibility matrix will be removed again.

See the [example workflow](example-workflows/release.yaml) for more details.

https://github.com/replicatedhq/replicated-actions/blob/71c3cdf8e9b72754fdad6394238d5f872c1b8c65/example-workflows/release.yaml#L1-L151

## Secrets and Pull Requests in GitHub Actions

Because these actions require use of the Replicated API token--commonly provided in a repository secret--it is important to understand some of the intrinsic details of how GitHub Actions treats secrets in certain scenarios.

A common use case for integrating GitHub Actions with Replicated may be during the [pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (PR) process. For example, you may choose to build a GitHub Action which creates a cluster and runs any number of tests in a Replicated environment when a PR is sent to your repository. By default, GitHub does not allow access to repository secrets when an Action is triggered from a remote fork because the fork is considered untrustworthy. See the note in the GitHub documentation [here](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#using-secrets-in-a-workflow). In the case of Replicated's GitHub actions, since the API token is a required input, if the secret cannot be loaded the workflow step which invokes the Replicated API will fail.

In order to provide a secure experience, we recommend the following process.

1. Use workflow approvals to prevent Actions from firing by default unless approved by a repository user with write access. See the GitHub documentation [here](https://docs.github.com/en/actions/managing-workflow-runs/approving-workflow-runs-from-public-forks) for more information.
2. Carefully inspect the PR prior to approving workflows to run.
3. Use the `pull_request_target` trigger in the Action which calls the Replicated service along with the status which should trigger the workflow. An example snippet is shown below. Note that this is only required if an Action which uses a Replicated step must fire on a PR from a fork as described previously.

For further reading on security in GitHub Actions, see [this three-part blog series](https://securitylab.github.com/research/github-actions-preventing-pwn-requests/) which goes into further depth.

### Action Examples

In this below snippet, the `pull_request_target` trigger is used in one of four possible states which serves to invoke an Action which uses a Replicated step. Use of the more common `pull_request` trigger is preferred if such an Action does not need to be invoked upon PRs from forks.

```yaml
name: Replicated demo
on:
  pull_request_target:
    types: [opened, synchronize, reopened, ready_for_review]
```
