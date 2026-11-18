# mirante-test

Test repository for Mirante: a small NestJS orders API with one pull request
(`feat/async-email`) that moves work from the controller into a service, a repository
and a background worker.

Mirante is vendored in `.github/actions/mirante` (the Action) and `mirante-viewer/`
(the viewer, published to GitHub Pages). Every pull request gets a comment with a
summary, an architecture diagram and a link to the interactive view.
