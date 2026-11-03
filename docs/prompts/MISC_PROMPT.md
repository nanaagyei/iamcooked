MVP implementation order

Here is the practical build sequence I’d actually use.

## Milestone 1: Brandable static MVP shell

Build:

Homepage
Incident feed UI with mock data
Incident detail UI with mock data
Scan upload page UI
Scan report mock UI
Newsletter capture
Responsive layout

Why first?
Because this creates product clarity. Before building workers and APIs, we need the product to feel real.


Milestone 2: Database + real incident model
Build:
Prisma schema
Incident CRUD
Source model
IncidentPackage model
Seed script
Admin draft/publish flow

Milestone 3: Lockfile parser

Build:
package-lock parser
pnpm parser
yarn parser
normalized dependency format
parser tests

Milestone 4: OSV scanner

Build:
OSV batch query integration
advisory persistence
finding generation
risk scoring
scan report persistence

Milestone 5: AI explanations

Build:
structured prompt contracts
incident extraction
beginner TLDR
technical summary
remediation plan
source verification
admin review

Milestone 6: Newsletter loop

Build:
email capture
digest preferences
weekly digest generation
critical alert rules


Milestone 7: Launch hardening

Build:
rate limiting
logging
privacy policy
terms
security page
QA pass
performance pass
SEO pages
