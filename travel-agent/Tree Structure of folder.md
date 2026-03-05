# File Tree: travel-agent

**Generated:** 3/5/2026, 12:19:09 PM
**Root Path:** `c:\Users\dhruv\.gemini\antigravity\scratch\github-travel-agent(Working)\travel-agent\travel-agent`

```
├── 📁 backend
│   ├── 📁 agents
│   │   ├── 📝 README.md
│   │   ├── 🐍 budget.py
│   │   ├── 🐍 destination.py
│   │   ├── 🐍 flight.py
│   │   ├── 🐍 food.py
│   │   ├── 🐍 hotel.py
│   │   ├── 🐍 itinerary.py
│   │   ├── 🐍 structured_output.py
│   │   ├── 🐍 team.py
│   │   └── 🐍 train.py
│   ├── 📁 agno_hackathon.egg-info
│   │   ├── 📄 PKG-INFO
│   │   ├── 📄 SOURCES.txt
│   │   ├── 📄 dependency_links.txt
│   │   ├── 📄 requires.txt
│   │   └── 📄 top_level.txt
│   ├── 📁 api
│   │   ├── 🐍 __init__.py
│   │   └── 🐍 app.py
│   ├── 📁 config
│   │   ├── 🐍 llm.py
│   │   └── 🐍 logger.py
│   ├── 📁 migrations
│   │   ├── 📄 create_plan_tasks_table.sql
│   │   └── 📄 create_trip_plan_tables.sql
│   ├── 📁 models
│   │   ├── 🐍 flight.py
│   │   ├── 🐍 hotel.py
│   │   ├── 🐍 plan_task.py
│   │   ├── 🐍 train.py
│   │   ├── 🐍 travel_plan.py
│   │   └── 🐍 trip_db.py
│   ├── 📁 repository
│   │   ├── 🐍 plan_task_repository.py
│   │   └── 🐍 trip_plan_repository.py
│   ├── 📁 router
│   │   └── 🐍 plan.py
│   ├── 📁 services
│   │   ├── 🐍 db_service.py
│   │   └── 🐍 plan_service.py
│   ├── 📁 tools
│   │   ├── 🐍 exa_flight.py
│   │   ├── 🐍 google_flight.py
│   │   ├── 🐍 indian_train.py
│   │   ├── 🐍 indian_train_mcp.py
│   │   ├── 🐍 kayak_flight.py
│   │   ├── 🐍 kayak_hotel.py
│   │   └── 🐍 scrape.py
│   ├── ⚙️ .env.example
│   ├── ⚙️ .env.template
│   ├── 🐳 Dockerfile
│   ├── 📝 README.md
│   ├── 🐍 broswer.py
│   ├── 🐍 check_all_statuses.py
│   ├── 🐍 check_db.py
│   ├── 🐍 check_status.py
│   ├── 📄 docker.sh
│   ├── 🐍 main.py
│   ├── ⚙️ pyproject.toml
│   ├── 🐍 reset_status.py
│   ├── 🐍 test_flight.py
│   ├── 🐍 test_gemini.py
│   ├── 🐍 test_gemini_new.py
│   ├── 📄 test_output.txt
│   ├── 🐍 test_train.py
│   ├── 🐍 test_train_mcp.py
│   └── 📄 uv.lock
├── 📁 client
│   ├── 📁 app
│   │   ├── 📁 api
│   │   │   ├── 📁 auth
│   │   │   │   └── 📁 [...all]
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 debug-data
│   │   │   ├── 📁 plan
│   │   │   │   └── 📁 submit
│   │   │   │       └── 📄 route.ts
│   │   │   └── 📁 plans
│   │   │       ├── 📁 [id]
│   │   │       │   ├── 📁 retry
│   │   │       │   │   └── 📄 route.ts
│   │   │       │   └── 📄 route.ts
│   │   │       └── 📄 route.ts
│   │   ├── 📁 auth
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 plan
│   │   │   ├── 📁 [id]
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 plans
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 favicon.ico
│   │   ├── 🎨 globals.css
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 components
│   │   ├── 📁 ui
│   │   │   ├── 📄 accordion.tsx
│   │   │   ├── 📄 badge.tsx
│   │   │   ├── 📄 button.tsx
│   │   │   ├── 📄 calendar.tsx
│   │   │   ├── 📄 card.tsx
│   │   │   ├── 📄 checkbox.tsx
│   │   │   ├── 📄 form.tsx
│   │   │   ├── 📄 input.tsx
│   │   │   ├── 📄 label.tsx
│   │   │   ├── 📄 popover.tsx
│   │   │   ├── 📄 radio-group.tsx
│   │   │   ├── 📄 select.tsx
│   │   │   ├── 📄 separator.tsx
│   │   │   ├── 📄 slider.tsx
│   │   │   ├── 📄 sonner.tsx
│   │   │   ├── 📄 tabs.tsx
│   │   │   └── 📄 textarea.tsx
│   │   ├── 📄 footer.tsx
│   │   └── 📄 header.tsx
│   ├── 📁 lib
│   │   ├── 📁 generated
│   │   │   └── 📁 prisma
│   │   │       ├── 📁 runtime
│   │   │       │   ├── 📄 edge-esm.js
│   │   │       │   ├── 📄 edge.js
│   │   │       │   ├── 📄 index-browser.d.ts
│   │   │       │   ├── 📄 index-browser.js
│   │   │       │   ├── 📄 library.d.ts
│   │   │       │   ├── 📄 library.js
│   │   │       │   ├── 📄 react-native.js
│   │   │       │   ├── 📄 wasm-compiler-edge.js
│   │   │       │   ├── 📄 wasm-engine-edge.js
│   │   │       │   └── 📄 wasm.js
│   │   │       ├── 📄 client.d.ts
│   │   │       ├── 📄 client.js
│   │   │       ├── 📄 default.d.ts
│   │   │       ├── 📄 default.js
│   │   │       ├── 📄 edge.d.ts
│   │   │       ├── 📄 edge.js
│   │   │       ├── 📄 index-browser.js
│   │   │       ├── 📄 index.d.ts
│   │   │       ├── 📄 index.js
│   │   │       ├── 📄 libquery_engine-debian-openssl-1.1.x.so.node
│   │   │       ├── ⚙️ package.json
│   │   │       ├── 📄 query_engine-windows.dll.node
│   │   │       ├── 📄 query_engine_bg.js
│   │   │       ├── 📄 query_engine_bg.wasm
│   │   │       ├── 📄 schema.prisma
│   │   │       ├── 📄 wasm-edge-light-loader.mjs
│   │   │       ├── 📄 wasm-worker-loader.mjs
│   │   │       ├── 📄 wasm.d.ts
│   │   │       └── 📄 wasm.js
│   │   ├── 📄 auth-client.ts
│   │   ├── 📄 auth.ts
│   │   ├── 📄 prisma.ts
│   │   └── 📄 utils.ts
│   ├── 📁 prisma
│   │   ├── 📁 migrations
│   │   │   ├── 📁 20250601095905_auth
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20250601105031_trip
│   │   │   │   └── 📄 migration.sql
│   │   │   ├── 📁 20250601112349_
│   │   │   │   └── 📄 migration.sql
│   │   │   └── ⚙️ migration_lock.toml
│   │   └── 📄 schema.prisma
│   ├── ⚙️ .env.template
│   ├── 🐳 Dockerfile
│   ├── 📝 README.md
│   ├── ⚙️ components.json
│   ├── 📄 eslint.config.mjs
│   ├── 📄 middleware.ts
│   ├── 📄 next-env.d.ts
│   ├── 📄 next.config.ts
│   ├── ⚙️ package-lock.json
│   ├── ⚙️ package.json
│   ├── ⚙️ pnpm-lock.yaml
│   ├── 📄 postcss.config.mjs
│   ├── 📄 schema.sql
│   ├── ⚙️ tsconfig.json
│   └── 📄 tsconfig.tsbuildinfo
├── 📝 README.md
├── 📝 SETUP_GUIDE.md
├── 🌐 dining_mockup.html
├── ⚙️ docker-compose.yml
├── 📝 feature engineering and model evalution.md
├── 📄 setup.sh
└── 📄 steps for starting.txt
```

---
*Generated by FileTree Pro Extension*