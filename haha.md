## Software Khata API Design

This document lists the API endpoints needed by the frontend, with request and response shapes.

Base URL:
- `http://localhost:5000/api`

Auth:
- All endpoints except `/auth/login` require `Authorization: Bearer <token>`.
- Response bodies use JSON.

Common Response Shape:
```json
{
	"data": {},
	"message": "optional message"
}
```

Common Error Shape:
```json
{
	"message": "Human readable error"
}
```

---

## Auth

### POST /auth/login
Request:
```json
{
	"email": "admin@khata.com",
	"password": "secret"
}
```

Response:
```json
{
	"data": {
		"session": {
			"access_token": "jwt-token"
		},
		"profile": {
			"id": "user-1",
			"name": "Admin",
			"role": "Admin",
			"color": "#2563eb",
			"avatar": "A"
		}
	}
}
```

Notes:
- Frontend stores `access_token` in localStorage.
- `profile` or `user` can be returned; frontend uses either.

### POST /auth/logout
Auth required.

Request:
```json
{}
```

Response:
```json
{
	"data": {
		"success": true
	}
}
```

---

## Expenses

### GET /expenses
Auth required.

Response:
```json
{
	"data": [
		{
			"id": "exp-1",
			"name": "AWS Cloud Hosting",
			"category": "Infrastructure (Cloud/Server)",
			"amount": 42000,
			"date": "2026-05-08",
			"method": "Corporate Card",
			"notes": "April bill",
			"trend": "0%"
		}
	]
}
```

### POST /expenses
Auth required.

Request:
```json
{
	"name": "AWS Cloud Hosting",
	"category": "Infrastructure (Cloud/Server)",
	"amount": 42000,
	"date": "2026-05-08",
	"method": "Corporate Card",
	"notes": "April bill",
	"trend": "0%"
}
```

Response:
```json
{
	"data": {
		"id": "exp-1",
		"name": "AWS Cloud Hosting",
		"category": "Infrastructure (Cloud/Server)",
		"amount": 42000,
		"date": "2026-05-08",
		"method": "Corporate Card",
		"notes": "April bill",
		"trend": "0%"
	}
}
```

---

## Projects and Payments

### GET /projects
Auth required.

Response:
```json
{
	"data": [
		{
			"id": "proj-1",
			"client": "Acme Corp",
			"project": "Mobile App Development",
			"total_amount": 250000,
			"status": "Partial",
			"date": "2026-05-01",
			"payments": [
				{
					"id": "pay-1",
					"amount": 50000,
					"date": "2026-05-03",
					"type": "Partial Payment",
					"notes": "Initial deposit"
				}
			]
		}
	]
}
```

Notes:
- Frontend accepts `total_amount` or `totalAmount`.
- `status` should be `Paid` or `Partial` for UI badges.

### POST /projects
Auth required.

Request:
```json
{
	"client": "Acme Corp",
	"project": "Mobile App Development",
	"totalAmount": 250000,
	"paidAmount": 50000,
	"date": "2026-05-01",
	"type": "Partial Payment",
	"notes": "Initial deposit"
}
```

Response:
```json
{
	"data": {
		"id": "proj-1",
		"client": "Acme Corp",
		"project": "Mobile App Development",
		"total_amount": 250000,
		"status": "Partial",
		"date": "2026-05-01",
		"payments": [
			{
				"id": "pay-1",
				"amount": 50000,
				"date": "2026-05-01",
				"type": "Partial Payment",
				"notes": "Initial deposit"
			}
		]
	}
}
```

### POST /projects/:id/payments
Auth required.

Request:
```json
{
	"amount": 20000,
	"type": "Partial Payment",
	"notes": "Additional payment"
}
```

Response:
```json
{
	"data": {
		"id": "proj-1",
		"client": "Acme Corp",
		"project": "Mobile App Development",
		"total_amount": 250000,
		"status": "Partial",
		"date": "2026-05-01",
		"payments": [
			{
				"id": "pay-1",
				"amount": 50000,
				"date": "2026-05-01",
				"type": "Partial Payment",
				"notes": "Initial deposit"
			},
			{
				"id": "pay-2",
				"amount": 20000,
				"date": "2026-05-08",
				"type": "Partial Payment",
				"notes": "Additional payment"
			}
		]
	}
}
```

---

## Profits and Distributions

### GET /profits
Auth required.

Response:
```json
{
	"data": {
		"available": 120000,
		"distributions": [
			{
				"id": "dist-1",
				"owner": "John Doe",
				"amount": 20000,
				"method": "Bank Transfer",
				"date": "2026-05-05"
			}
		]
	}
}
```

### POST /profits/distributions
Auth required.

Request:
```json
{
	"distributions": [
		{
			"owner": "John Doe",
			"amount": 20000,
			"method": "Bank Transfer"
		},
		{
			"owner": "Jane Smith",
			"amount": 15000,
			"method": "Cash"
		}
	]
}
```

Response:
```json
{
	"data": {
		"available": 120000,
		"distributions": [
			{
				"id": "dist-1",
				"owner": "John Doe",
				"amount": 20000,
				"method": "Bank Transfer",
				"date": "2026-05-05"
			},
			{
				"id": "dist-2",
				"owner": "Jane Smith",
				"amount": 15000,
				"method": "Cash",
				"date": "2026-05-05"
			}
		]
	}
}
```

---

## Validation Notes
- `amount`, `totalAmount`, and `paidAmount` should be numbers.
- `date` should be ISO format `YYYY-MM-DD`.
- `status` should be `Paid` or `Partial`.
- All list endpoints return arrays; empty list should be `[]`.

## Optional (Not currently used by UI)
- `GET /auth/me` to return current user profile for session refresh.
- `GET /reports` or `GET /history` if you wire the header tabs later.

---

## Backend Route Design (Express)

Routes are grouped under `/api`.

```txt
/api
	/auth
		POST /login
		POST /logout
	/expenses
		GET /
		POST /
	/projects
		GET /
		POST /
		POST /:id/payments
	/profits
		GET /
		POST /distributions
```

Suggested file layout (matching current backend structure):

```txt
backend/src/
	routes/
		api.js
		auth.js
		expenses.js
		projects.js
		profits.js
	controllers/
		authController.js
		expenseController.js
		projectController.js
		profitController.js
	middleware/
		requireAuth.js
		validate.js
```

---

## Controller Responsibilities

### Auth Controller
File: `controllers/authController.js`

Methods:
- `login(req, res)`
	- Validate `email`, `password`.
	- Authenticate (Supabase auth or custom).
	- Return `{ session: { access_token }, profile }`.
- `logout(req, res)`
	- Invalidate token if supported; otherwise return success.

### Expense Controller
File: `controllers/expenseController.js`

Methods:
- `listExpenses(req, res)`
	- Fetch all expenses for current user/org.
	- Return array sorted by date desc (optional).
- `createExpense(req, res)`
	- Validate required fields.
	- Insert expense and return created row.

### Project Controller
File: `controllers/projectController.js`

Methods:
- `listProjects(req, res)`
	- Fetch projects with payments included.
	- Return array with `payments` per project.
- `createProject(req, res)`
	- Validate required fields.
	- Create project and initial payment if `paidAmount > 0`.
	- Set status `Paid` when total paid >= total amount, else `Partial`.
- `recordPayment(req, res)`
	- Validate `amount`, `type`.
	- Insert payment, recompute project status, return updated project.

### Profit Controller
File: `controllers/profitController.js`

Methods:
- `getProfitSummary(req, res)`
	- Compute `available` as total payments - total expenses.
	- Return distributions list with `available`.
- `recordDistributions(req, res)`
	- Validate array of distributions.
	- Insert distributions and return updated summary.

---

## Route Wiring (Sample)

`routes/api.js`
```js
import express from "express";
import authRoutes from "./auth.js";
import expenseRoutes from "./expenses.js";
import projectRoutes from "./projects.js";
import profitRoutes from "./profits.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/expenses", expenseRoutes);
router.use("/projects", projectRoutes);
router.use("/profits", profitRoutes);

export default router;
```

`routes/expenses.js`
```js
import express from "express";
import { listExpenses, createExpense } from "../controllers/expenseController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, listExpenses);
router.post("/", requireAuth, createExpense);

export default router;
```

`routes/projects.js`
```js
import express from "express";
import { listProjects, createProject, recordPayment } from "../controllers/projectController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, listProjects);
router.post("/", requireAuth, createProject);
router.post("/:id/payments", requireAuth, recordPayment);

export default router;
```

`routes/profits.js`
```js
import express from "express";
import { getProfitSummary, recordDistributions } from "../controllers/profitController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/", requireAuth, getProfitSummary);
router.post("/distributions", requireAuth, recordDistributions);

export default router;
```

`routes/auth.js`
```js
import express from "express";
import { login, logout } from "../controllers/authController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", requireAuth, logout);

export default router;
```

---

## Validation Rules (Minimum)

### Expense
- `name`: required string
- `category`: required string
- `amount`: required number > 0
- `date`: required `YYYY-MM-DD`
- `method`: required string

### Project
- `client`: required string
- `project`: required string
- `totalAmount`: required number > 0
- `paidAmount`: required number >= 0
- `date`: required `YYYY-MM-DD`
- `type`: required string

### Payment
- `amount`: required number > 0
- `type`: required string

### Distribution
- `owner`: required string
- `amount`: required number > 0
- `method`: required string
