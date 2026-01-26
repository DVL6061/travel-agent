# 🛠️ Project Robustness TODO List

- [x] **Task 1: Fix Tool Schema Mismatch (Flight Agent)**
  -Indication: `additionalProperties 'return_date' not allowed`
  - Action: Inject strict JSON schema instructions into `flight.py`.
  - Status: Complete ✅ (Old code kept commented)

- [x] **Task 2: Fix Type Mismatch (Flight Agent)**
  - Indication: `cabin_class: expected object, but got string`
  - Action: Update `flight.py` prompt to explicitly define object structure for enum-like fields.
  - Status: Complete ✅ (Old code kept commented)

- [x] **Task 3: Implement Error Reflection Logic (Plan Service)**
  - Indication: `Agent returned response with no messages` (recursive failure)
  - Action: Update `safe_agent_run` in `plan_service.py` to feed tool errors back to the model for correction.
  - Status: Complete ✅ (Old code kept commented)

- [x] **Task 4: Permanent TPM/Quota Shield**
  - Indication: `requested 20,497 tokens, limit 6,000`
  - Action: Lock in the model selection in `llm.py` and optimize search result trimming.
  - Status: Complete ✅ (Old code kept commented)
