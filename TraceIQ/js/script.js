/* ============================================================
   TRACEIQ — FRONTEND SCRIPT
   ============================================================
   Architecture:

   TraceIQ Frontend
          ↓
   Spring Boot :8080
          ↓
   PostgreSQL
          ↓
   Python FastAPI :8000
          ↓
   Hindsight :8888
          ↓
   Groq AI

   ============================================================ */


/* ============================================================
   BACKEND CONFIGURATION
   ============================================================ */

const TRACEIQ_CONFIG = {
  JAVA_API: 'http://localhost:8080/api',
  PYTHON_API: 'http://127.0.0.1:8000'
};


/* ============================================================
   JAVA / SPRING BOOT API
   ============================================================ */

async function javaGet(endpoint) {
  const response = await fetch(
    `${TRACEIQ_CONFIG.JAVA_API}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Spring Boot API error: ${response.status}`
    );
  }

  return response.json();
}


async function javaPost(endpoint, data) {
  const response = await fetch(
    `${TRACEIQ_CONFIG.JAVA_API}${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    let message = `Spring Boot API error: ${response.status}`;

    try {
      const errorData = await response.json();

      if (errorData.message) {
        message = errorData.message;
      }

      if (errorData.error) {
        message += ` - ${errorData.error}`;
      }

    } catch (e) {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }

  return response.json();
}


/* ============================================================
   PYTHON / FASTAPI API
   ============================================================ */

async function aiPost(endpoint, data) {
  const response = await fetch(
    `${TRACEIQ_CONFIG.PYTHON_API}${endpoint}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    throw new Error(
      `Python AI API error: ${response.status}`
    );
  }

  return response.json();
}


async function aiGet(endpoint) {
  const response = await fetch(
    `${TRACEIQ_CONFIG.PYTHON_API}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `Python AI API error: ${response.status}`
    );
  }

  return response.json();
}


/* ============================================================
   CONNECTION TEST
   ============================================================ */

async function testTraceIQConnections() {

  console.log('================================');
  console.log('TraceIQ connection test');
  console.log('================================');


  /* ---------- Python ---------- */

  try {

    const response = await fetch(
      `${TRACEIQ_CONFIG.PYTHON_API}/health`
    );

    if (response.ok) {

      console.log(
        '✅ Python AI service connected'
      );

    } else {

      console.warn(
        '⚠️ Python service responded with error'
      );

    }

  } catch (error) {

    console.warn(
      '⚠️ Python AI service is not running:',
      error.message
    );

  }


  /* ---------- Spring Boot ---------- */

  try {

    const response = await fetch(
      `${TRACEIQ_CONFIG.JAVA_API}/health`
    );

    if (response.ok) {

      console.log(
        '✅ Spring Boot connected'
      );

    } else {

      console.warn(
        '⚠️ Spring Boot responded with error'
      );

    }

  } catch (error) {

    console.warn(
      '⚠️ Spring Boot is not running:',
      error.message
    );

  }

}


/* ============================================================
   DEMO INCIDENT DATA
   ============================================================ */

const incidents = [

  {
    id: 'INC-002',
    service: 'Payment API',
    error: 'HTTP 503',
    severity: 'Critical',
    status: 'Investigating',
    env: 'Production',
    version: 'v2.4.1',
    date: 'Sep 29, 2026',
    time: '10:31',
    related: 'INC-001',
    mttr: null,

    root: 'Not yet determined',
    failed: '—',
    fix: '—',
    lesson: '—',

    observe:
      'Current database pool utilization has not yet been verified.',

    verify:
      'Check database connection pool utilization'
  },


  {
    id: 'INC-001',
    service: 'Payment API',
    error: 'HTTP 503',
    severity: 'Critical',
    status: 'Resolved',
    env: 'Production',
    version: 'v2.3.9',
    date: 'Sep 21, 2026',
    time: '16:04',
    related: null,
    mttr: 47,

    root:
      'Database connection pool exhaustion',

    failed:
      'Restart service',

    fix:
      'Increase database connection pool',

    lesson:
      'Check pool utilization before restarting.',

    observe:
      'Resolved.',

    verify:
      'No further action'
  },


  {
    id: 'INC-003',
    service: 'Search API',
    error: 'P95 latency 1.8s',
    severity: 'Warning',
    status: 'Investigating',
    env: 'Production',
    version: 'v1.8.2',
    date: 'Sep 29, 2026',
    time: '09:12',
    related: null,
    mttr: null,

    root:
      'Not yet determined',

    failed:
      '—',

    fix:
      '—',

    lesson:
      '—',

    observe:
      'Latency rose after the last index refresh; error rate is normal.',

    verify:
      'Compare refresh job schedule with the latency spike'
  },


  {
    id: 'INC-004',
    service: 'Notification Worker',
    error: 'Queue delay 4m',
    severity: 'Warning',
    status: 'Resolved',
    env: 'Production',
    version: 'v3.1.0',
    date: 'Sep 26, 2026',
    time: '14:08',
    related: null,
    mttr: 22,

    root:
      'Worker capacity below traffic burst',

    failed:
      'Raise batch size only',

    fix:
      'Add two workers and tune batch size',

    lesson:
      'Scale consumers before tuning batch size.',

    observe:
      'Resolved.',

    verify:
      'No further action'
  },


  {
    id: 'INC-005',
    service: 'Inventory API',
    error: 'HTTP 409',
    severity: 'Warning',
    status: 'Resolved',
    env: 'Production',
    version: 'v2.0.4',
    date: 'Sep 25, 2026',
    time: '18:46',
    related: null,
    mttr: 31,

    root:
      'Concurrent writes without idempotency key',

    failed:
      'Retry on conflict',

    fix:
      'Add transaction lock and idempotency keys',

    lesson:
      'Retries amplify write races; fix the key first.',

    observe:
      'Resolved.',

    verify:
      'No further action'
  },


  {
    id: 'INC-006',
    service: 'Order API',
    error: 'HTTP 401',
    severity: 'Warning',
    status: 'Resolved',
    env: 'Production',
    version: 'v1.4.2',
    date: 'Sep 23, 2026',
    time: '10:16',
    related: null,
    mttr: 18,

    root:
      'Token issuer and audience mismatch',

    failed:
      'Rotate signing keys',

    fix:
      'Align issuer and audience settings',

    lesson:
      'Diff config before rotating credentials.',

    observe:
      'Resolved.',

    verify:
      'No further action'
  }

];


/* ============================================================
   GLOBAL STATE
   ============================================================ */

const main = document.querySelector('#main');
const chat = document.querySelector('#chat');
const toast = document.querySelector('#toast');


const S = {
  memory: true,
  hints: true,
  notify: true,
  quiet: false,
  skip: false
};


const F = {
  q: '',
  f: 'all',
  svc: 'all'
};


let cur = {
  p: 'home',
  a: null
};


let tok = 0;
let tt;


/* ============================================================
   ICONS
   ============================================================ */

const P = {

  check:
    'M4 12l5 5L20 6',

  x:
    'M6 6l12 12M18 6L6 18',

  q:
    'M9.5 9a2.5 2.5 0 115 0c0 1.7-2.5 2-2.5 4M12 17v.5',

  arrow:
    'M5 12h14M13 6l6 6-6 6',

  bulb:
    'M9 18h6M10 21h4M12 3a6 6 0 00-3 11c.7.6 1 1.3 1 2h4c0-.7.3-1.4 1-2a6 6 0 00-3-11z',

  sun:
    'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',

  moon:
    'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',

  grid:
    'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',

  alert:
    'M12 3l10 18H2zM12 10v5M12 18v.5',

  search:
    'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5',

  layers:
    'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',

  res:
    'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-6',

  cog:
    'M12 9a3 3 0 100 6 3 3 0 000-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',

  menu:
    'M4 6h16M4 12h16M4 18h16',

  ask:
    'M4 5h16v11H9l-5 4z'
};


const ic = (name, size = 16) => {

  const path =
    P[name] || P.q;

  return `
    <svg
      class="ic"
      width="${size}"
      height="${size}"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="${path}"></path>
    </svg>
  `;

};


const chip = (text, color) =>
  `<span class="chip t-${color}">${escapeHtml(text)}</span>`;


const sevC = incident =>
  incident.severity === 'Critical'
    ? 'red'
    : 'amb';


const stC = incident =>
  incident.status === 'Resolved'
    ? 'grn'
    : 'blu';


const byId = id =>
  incidents.find(
    incident => incident.id === id
  );


const rel = incident =>
  incident.related
    ? byId(incident.related)
    : null;


const active = () =>
  incidents.find(
    incident =>
      incident.status !== 'Resolved' &&
      incident.severity === 'Critical'
  ) || incidents[0];


/* ============================================================
   GENERAL HELPERS
   ============================================================ */

function showToast(message) {

  if (!toast) {
    return;
  }

  toast.textContent = message;

  toast.classList.add('show');

  clearTimeout(tt);

  tt = setTimeout(
    () => toast.classList.remove('show'),
    2200
  );
}


function escapeHtml(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function tm(baseTime, offset) {

  if (!baseTime) {
    return '--:--';
  }

  const [hours, minutes] =
    baseTime.split(':').map(Number);

  const total =
    hours * 60 +
    minutes +
    offset;

  return (
    String(
      Math.floor(total / 60) % 24
    ).padStart(2, '0') +
    ':' +
    String(
      total % 60
    ).padStart(2, '0')
  );

}


/* ============================================================
   NEW INCIDENT
   ============================================================ */

function openNewIncidentForm() {

  main.innerHTML = `

    <div class="pg-h">

      <div>

        <h1>New Incident</h1>

        <p class="sub">
          Create an incident and send it to the
          TraceIQ investigation agent.
        </p>

      </div>


      <button
        class="btn ghost"
        onclick="showPage('incidents')"
      >
        ← Back to incidents
      </button>

    </div>


    <section
      class="card"
      style="max-width:760px"
    >

      <div class="card-h">

        <div>

          <h3>Incident details</h3>

          <p
            class="sub"
            style="margin-top:4px"
          >
            The incident will be stored in PostgreSQL
            and analyzed by the AI service.
          </p>

        </div>

      </div>


      <form
        id="new-incident-form"
        class="pad"
      >

        <div class="grid2">

          <div>

            <label
              class="form-label"
              for="new-service"
            >
              Service
            </label>

            <input
              id="new-service"
              class="form-input"
              type="text"
              placeholder="Payment API"
              required
            >

          </div>


          <div>

            <label
              class="form-label"
              for="new-error-code"
            >
              Error Code
            </label>

            <input
              id="new-error-code"
              class="form-input"
              type="text"
              placeholder="HTTP 503"
              required
            >

          </div>

        </div>


        <div style="margin-top:18px">

          <label
            class="form-label"
            for="new-description"
          >
            Incident Description
          </label>

          <textarea
            id="new-description"
            class="form-input"
            rows="6"
            placeholder="Describe what is happening. Example: Payment API is returning HTTP 503 errors for production requests."
            required
          ></textarea>

        </div>


        <div
          id="new-incident-status"
          style="margin-top:16px"
        ></div>


        <div
          class="row"
          style="
            justify-content:flex-end;
            margin-top:20px;
          "
        >

          <button
            type="button"
            class="btn ghost"
            onclick="showPage('incidents')"
          >
            Cancel
          </button>


          <button
            type="submit"
            class="btn"
            id="create-incident-btn"
          >
            Create & Investigate
          </button>

        </div>

      </form>

    </section>

  `;


  const form =
    document.querySelector(
      '#new-incident-form'
    );


  if (form) {

    form.addEventListener(
      'submit',
      submitNewIncident
    );

  }


  const serviceInput =
    document.querySelector(
      '#new-service'
    );


  if (serviceInput) {
    serviceInput.focus();
  }

}


/* ============================================================
   CREATE NEW INCIDENT
   ============================================================ */

async function submitNewIncident(event) {

  event.preventDefault();


  const service =
    document
      .querySelector('#new-service')
      ?.value
      .trim();


  const errorCode =
    document
      .querySelector('#new-error-code')
      ?.value
      .trim();


  const description =
    document
      .querySelector('#new-description')
      ?.value
      .trim();


  const button =
    document.querySelector(
      '#create-incident-btn'
    );


  const statusBox =
    document.querySelector(
      '#new-incident-status'
    );


  if (
    !service ||
    !errorCode ||
    !description
  ) {

    if (statusBox) {

      statusBox.innerHTML = `
        <div class="state err">
          ${ic('alert', 20)}
          Please fill in all incident fields.
        </div>
      `;

    }

    return;
  }


  if (button) {

    button.disabled = true;

    button.textContent =
      'Creating incident...';

  }


  if (statusBox) {

    statusBox.innerHTML = `
      <div class="state">
        ${ic('search', 20)}

        <p>
          Saving incident and asking
          TraceIQ AI to investigate...
        </p>
      </div>
    `;

  }


  try {

    /*
      IMPORTANT:

      These names must match IncidentRequestDto.java
    */

    const payload = {

      service: service,

      errorCode: errorCode,

      description: description

    };


    console.log(
      '📤 Sending incident to Spring Boot:',
      payload
    );


    /*
      POST:

      http://localhost:8080/api/incidents
    */

    const result =
      await javaPost(
        '/incidents',
        payload
      );


    console.log(
      '📥 Spring Boot response:',
      result
    );


    if (!result || !result.incident) {

      throw new Error(
        'Spring Boot returned an invalid incident response.'
      );

    }


    /*
      Convert Java entity
      into TraceIQ UI object.
    */

    const newIncident =
      convertBackendIncident(
        result.incident,
        result.ai
      );


    /*
      Add the new incident
      to the frontend list.
    */

    incidents.unshift(
      newIncident
    );


    /*
      Success notification.
    */

    showToast(
      `${newIncident.id} created successfully.`
    );


    /*
      Open incident detail.
    */

    showPage(
      'detail',
      newIncident.id,
      true
    );


    /*
      Show AI response
      in Ask TraceIQ drawer.
    */

    setTimeout(
      () => {

        displayAIResult(
          result.ai,
          newIncident
        );

      },
      200
    );


  } catch (error) {

    console.error(
      '❌ Failed to create incident:',
      error
    );


    if (statusBox) {

      statusBox.innerHTML = `

        <div class="state err">

          ${ic('alert', 22)}

          <h3>
            Unable to create incident
          </h3>

          <p>
            ${escapeHtml(error.message)}
          </p>

          <p style="margin-top:8px">

            Make sure Spring Boot is running on

            <strong>
              http://localhost:8080
            </strong>

            and Python is running on

            <strong>
              http://127.0.0.1:8000
            </strong>.

          </p>

        </div>

      `;

    }


    if (button) {

      button.disabled = false;

      button.textContent =
        'Create & Investigate';

    }

  }

}


/* ============================================================
   CONVERT BACKEND INCIDENT
   ============================================================ */

function convertBackendIncident(
  incident,
  aiResponse
) {

  const created =
    incident.createdAt
      ? new Date(incident.createdAt)
      : new Date();


  const validDate =
    Number.isNaN(
      created.getTime()
    )
      ? new Date()
      : created;


  const date =
    validDate.toLocaleDateString(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }
    );


  const time =
    validDate.toLocaleTimeString(
      'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }
    );


  const aiText =
    extractAIText(aiResponse);


  const backendId =
    incident.id;


  const frontendId =
    backendId !== null &&
    backendId !== undefined
      ? `INC-${String(backendId).padStart(3, '0')}`
      : `INC-${Date.now()}`;


  return {

    id:
      frontendId,

    backendId:
      backendId,

    service:
      incident.service ||
      'Unknown Service',

    error:
      incident.errorCode ||
      'Unknown Error',

    severity:
      determineSeverity(
        incident.errorCode,
        incident.description
      ),

    status:
      incident.status === 'RESOLVED'
        ? 'Resolved'
        : 'Investigating',

    env:
      'Production',

    version:
      'Current',

    date:
      date,

    time:
      time,

    related:
      null,

    mttr:
      null,

    root:
      extractAIField(
        aiResponse,
        [
          'root',
          'root_cause',
          'rootCause'
        ],
        'Not yet determined'
      ),

    failed:
      extractAIField(
        aiResponse,
        [
          'failed',
          'failed_attempt',
          'failedAttempt'
        ],
        '—'
      ),

    fix:
      extractAIField(
        aiResponse,
        [
          'fix',
          'successful_resolution',
          'successfulResolution',
          'recommended_action',
          'recommendation'
        ],
        '—'
      ),

    lesson:
      extractAIField(
        aiResponse,
        [
          'lesson',
          'lesson_learned',
          'lessonLearned'
        ],
        aiText ||
          'TraceIQ AI analysis available.'
      ),

    observe:
      incident.description ||
      'Current incident is being investigated.',

    verify:
      extractAIField(
        aiResponse,
        [
          'verify',
          'recommended_verification',
          'recommendedVerification'
        ],
        'Review the current incident metrics and logs.'
      ),

    aiResponse:
      aiResponse

  };

}


/* ============================================================
   DETERMINE SEVERITY
   ============================================================ */

function determineSeverity(
  errorCode,
  description
) {

  const text =
    `${errorCode || ''} ${description || ''}`
      .toLowerCase();


  if (

    text.includes('503') ||

    text.includes('500') ||

    text.includes('critical') ||

    text.includes('outage') ||

    text.includes('down')

  ) {

    return 'Critical';

  }


  return 'Warning';

}


/* ============================================================
   EXTRACT AI RESPONSE TEXT
   ============================================================ */

function extractAIText(aiResponse) {

  if (!aiResponse) {
    return '';
  }


  if (
    typeof aiResponse === 'string'
  ) {

    return aiResponse;

  }


  return (

    aiResponse.message ||

    aiResponse.analysis ||

    aiResponse.recommendation ||

    aiResponse.response ||

    aiResponse.text ||

    ''

  );

}


/* ============================================================
   EXTRACT AI FIELD
   ============================================================ */

function extractAIField(
  aiResponse,
  fields,
  fallback
) {

  if (!aiResponse) {
    return fallback;
  }


  if (!Array.isArray(fields)) {
    fields = [fields];
  }


  /*
    Check direct AI response.
  */

  for (const field of fields) {

    if (

      aiResponse[field] !== undefined &&

      aiResponse[field] !== null

    ) {

      return aiResponse[field];

    }

  }


  /*
    Check aiResponse.analysis.
  */

  if (

    aiResponse.analysis &&

    typeof aiResponse.analysis === 'object'

  ) {

    for (const field of fields) {

      if (

        aiResponse.analysis[field] !== undefined &&

        aiResponse.analysis[field] !== null

      ) {

        return aiResponse.analysis[field];

      }

    }

  }


  /*
    Check aiResponse.result.
  */

  if (

    aiResponse.result &&

    typeof aiResponse.result === 'object'

  ) {

    for (const field of fields) {

      if (

        aiResponse.result[field] !== undefined &&

        aiResponse.result[field] !== null

      ) {

        return aiResponse.result[field];

      }

    }

  }


  return fallback;

}


/* ============================================================
   DISPLAY AI RESULT
   ============================================================ */

function displayAIResult(
  aiResponse,
  incident
) {

  const text =
    extractAIText(aiResponse);


  if (!chat) {
    return;
  }


  openDrawer();


  if (text) {

    addMessage(
      'ai',
      `
        <div class="bubble-label">
          TraceIQ AI Investigation
        </div>

        <strong>
          ${escapeHtml(incident.id)}
        </strong>

        —
        ${escapeHtml(incident.service)}

        ·
        ${escapeHtml(incident.error)}

        <div
          class="steps"
          style="margin-top:10px"
        >
          ${escapeHtml(text)}
        </div>
      `
    );

  } else {

    addMessage(
      'ai',
      `
        <div class="bubble-label">
          TraceIQ AI Investigation
        </div>

        Incident

        <strong>
          ${escapeHtml(incident.id)}
        </strong>

        was created and sent to the AI service.
      `
    );

  }

}


/* ============================================================
   SHARED COMPONENTS
   ============================================================ */

function block(
  key,
  title,
  iconName,
  body
) {

  return `
    <div class="blk ${key}">

      <div class="blk-h">

        ${ic(iconName, 15)}

        ${escapeHtml(title)}

      </div>

      ${body}

    </div>
  `;

}


function panel(x) {

  if (
    !S.memory &&
    !S.skip
  ) {

    return `

      <section class="card">

        <div class="inv-h">

          <h2>
            TraceIQ Investigation
          </h2>

        </div>


        <div class="state err">

          ${ic('alert', 22)}

          <h3>
            Hindsight memory unavailable
          </h3>

          <p>
            Historical context is temporarily unavailable.
            TraceIQ can continue the investigation using
            current incident data.
          </p>


          <div class="row">

            <button
              class="btn sm"
              onclick="
                S.memory=true;
                refresh();
                showToast('Memory reconnected.')
              "
            >
              Retry
            </button>


            <button
              class="btn sm ghost"
              onclick="
                S.skip=true;
                refresh()
              "
            >
              Continue Investigation
            </button>

          </div>

        </div>

      </section>

    `;

  }


  const relatedIncident =
    S.memory
      ? rel(x)
      : null;


  const historicalBlock =
    relatedIncident

      ? block(
          'hist',
          'Historical evidence',
          'layers',
          `

            <div class="ev">

              ${ic('check', 15)}

              <span>

                ${escapeHtml(
                  relatedIncident.id
                )}

                experienced the same

                ${escapeHtml(
                  relatedIncident.error
                )}

                on

                ${escapeHtml(
                  relatedIncident.service
                )}

              </span>

            </div>


            <dl class="kv">

              <div>

                <dt>
                  Previous root cause
                </dt>

                <dd>
                  ${escapeHtml(
                    relatedIncident.root
                  )}
                </dd>

              </div>


              <div>

                <dt>
                  Previous attempt
                </dt>

                <dd>

                  ${escapeHtml(
                    relatedIncident.failed
                  )}

                  ${chip(
                    'Failed',
                    'red'
                  )}

                </dd>

              </div>


              <div>

                <dt>
                  Successful resolution
                </dt>

                <dd>
                  ${escapeHtml(
                    relatedIncident.fix
                  )}
                </dd>

              </div>


              <div>

                <dt>
                  Lesson
                </dt>

                <dd>
                  ${escapeHtml(
                    relatedIncident.lesson
                  )}
                </dd>

              </div>

            </dl>

          `
        )

      : block(
          'hist',
          'Historical evidence',
          'layers',
          `

            <div class="state">

              ${ic('search', 22)}

              <h3>
                No historical evidence found
              </h3>

              <p>
                TraceIQ couldn't find a sufficiently
                similar previous incident.
              </p>

            </div>

          `
        );


  return `

    <section class="card">

      <div class="inv-h">

        <h2>
          TraceIQ Investigation
        </h2>


        ${chip(
          relatedIncident
            ? 'Related incident found'
            : 'No related incident',
          relatedIncident
            ? 'pur'
            : 'blu'
        )}

      </div>


      ${historicalBlock}


      ${block(
        'cur',
        'Current observation',
        'q',
        `

          <div class="ev">

            ${ic('q', 15)}

            <span>
              ${escapeHtml(
                x.observe
              )}
            </span>

          </div>

        `
      )}


      ${block(
        'ver',
        'Recommended verification',
        'arrow',
        `

          <div class="ev">

            ${ic('arrow', 15)}

            <span>
              ${escapeHtml(
                x.verify
              )}
            </span>

          </div>


          <p class="note">

            Historical memory is a lead,
            not a verdict.

            Confirm with current data
            before acting.

          </p>

        `
      )}

    </section>

  `;

}


/* ============================================================
   ATTEMPTS
   ============================================================ */

function attempts(x) {

  const source =
    rel(x) ||
    (
      x.status === 'Resolved'
        ? x
        : null
    );


  return `

    <section class="card">

      <div class="card-h">

        <h3>
          Previous attempts
        </h3>


        ${
          source
            ? `
              <span
                class="id"
                style="
                  font-size:12px;
                  color:var(--mu)
                "
              >
                ${escapeHtml(
                  source.id
                )}
              </span>
            `
            : ''
        }

      </div>


      ${
        source

          ? `

            <div class="att">

              <div class="failed">

                ${ic('x')}

                <p>

                  <b>
                    ${escapeHtml(
                      source.failed
                    )}
                  </b>

                  <span>
                    Failed
                  </span>

                </p>

              </div>


              <div class="success">

                ${ic('check')}

                <p>

                  <b>
                    ${escapeHtml(
                      source.fix
                    )}
                  </b>

                  <span>
                    Successful
                  </span>

                </p>

              </div>


              <div class="lesson">

                ${ic('bulb')}

                <p>

                  <b>
                    Lesson learned
                  </b>

                  <span>
                    “${escapeHtml(
                      source.lesson
                    )}”
                  </span>

                </p>

              </div>

            </div>

          `

          : `

            <div class="state">

              <p>
                No recorded attempts yet.
              </p>

            </div>

          `
      }

    </section>

  `;

}


/* ============================================================
   INVESTIGATION TRAIL
   ============================================================ */

function trail(x) {

  const source =
    rel(x) ||
    (
      x.status === 'Resolved'
        ? x
        : null
    );


  if (!source) {
    return '';
  }


  const nodes = [

    [
      `${source.id} · ${source.service}`,
      source.error,
      'blu'
    ],

    [
      'Root cause',
      source.root,
      'amb'
    ],

    [
      'Failed attempt',
      source.failed,
      'red'
    ],

    [
      'Successful fix',
      source.fix,
      'grn'
    ],

    [
      'Lesson',
      source.lesson,
      'pur'
    ]

  ];


  return `

    <section class="card">

      <div class="card-h">

        <h3>
          Investigation trail
        </h3>

      </div>


      <div class="trail">

        ${
          nodes.map(
            node => `

              <div
                class="tn"
                style="--c:var(--${node[2]})"
              >

                <i></i>

                <div>

                  <small>
                    ${escapeHtml(node[0])}
                  </small>

                  <b>
                    ${escapeHtml(node[1])}
                  </b>

                </div>

              </div>

            `
          ).join('')
        }

      </div>

    </section>

  `;

}


/* ============================================================
   TIMELINE
   ============================================================ */

function timeline(x) {

  const relatedIncident =
    rel(x);


  const baseTime =
    x.time;


  const events =
    relatedIncident

      ? [

          [0, 'Incident detected'],

          [1, 'Historical incidents searched'],

          [
            1,
            `${relatedIncident.id} identified as related`
          ],

          [
            2,
            'Previous failed action identified'
          ],

          [
            2,
            'Current evidence evaluated'
          ],

          [
            3,
            'Verification recommended'
          ]

        ]

      : [

          [0, 'Incident detected'],

          [1, 'Historical incidents searched'],

          [
            1,
            'No sufficiently similar incident found'
          ],

          [
            2,
            'Current evidence evaluated'
          ],

          [
            3,
            'Verification recommended'
          ]

        ];


  return `

    <section class="card">

      <div class="card-h">

        <h3>
          Incident timeline
        </h3>

      </div>


      <div class="tl">

        ${
          events.map(
            (event, index) => `

              <div
                class="${
                  index === events.length - 1
                    ? 'next'
                    : ''
                }"
              >

                <time>
                  ${tm(
                    baseTime,
                    event[0]
                  )}
                </time>

                <span>
                  ${escapeHtml(
                    event[1]
                  )}
                </span>

              </div>

            `
          ).join('')
        }

      </div>

    </section>

  `;

}


/* ============================================================
   ACTIVITY
   ============================================================ */

function activity(x) {

  const relatedIncident =
    rel(x);


  return `

    <section class="card">

      <div class="card-h">

        <h3>
          Investigation activity
        </h3>

      </div>


      <div class="act">

        <div>
          ${ic('check')}
          Incident received
        </div>


        <div>
          ${ic('check')}
          Historical memory searched
        </div>


        <div>
          ${ic('check')}

          ${
            relatedIncident
              ? 'Related incident found'
              : 'No related incident found'
          }

        </div>


        ${
          relatedIncident
            ? `

              <div>
                ${ic('check')}
                Previous outcome identified
              </div>

            `
            : ''
        }


        <div>

          ${ic('check')}

          Current evidence checked

        </div>


        <div class="go">

          ${ic('arrow')}

          Verification recommended

        </div>

      </div>

    </section>

  `;

}


/* ============================================================
   FLOW
   ============================================================ */

function flow(x) {

  const currentStep =
    x.status === 'Resolved'
      ? 5
      : 2;


  const labels = [

    'Incident',

    'Historical context',

    'Investigation',

    'Recommended action',

    'Resolution'

  ];


  return `

    <div class="flow">

      ${
        labels.map(
          (label, index) => {

            const done =
              index < currentStep - 1 ||
              currentStep === 5;


            const now =
              index === currentStep - 1 &&
              currentStep !== 5;


            return `

              <div
                class="
                  ${done ? 'done' : ''}
                  ${now ? 'now' : ''}
                "
              >

                ${
                  done
                    ? ic('check', 14)
                    : ''
                }

                ${escapeHtml(label)}

              </div>

            `;

          }
        ).join('')
      }

    </div>

  `;

}


/* ============================================================
   ACTIVE INCIDENT CARD
   ============================================================ */

function activeCard(x) {

  if (!x) {
    return '';
  }


  return `

    <section
      class="card active-card"
      style="
        border-left-color:
        var(--${sevC(x)})
      "
    >

      <div class="ac-top">

        <div>

          <div class="meta">

            <span class="id">
              ${escapeHtml(x.id)}
            </span>


            ${chip(
              String(x.severity).toUpperCase(),
              sevC(x)
            )}


            ${chip(
              String(x.status).toUpperCase(),
              stC(x)
            )}

          </div>


          <h1>

            ${escapeHtml(x.service)}

            <span
              style="
                color:var(--mu);
                font-weight:500
              "
            >
              · ${escapeHtml(x.error)}
            </span>

          </h1>


          <div class="meta sub">

            <span>
              ${escapeHtml(x.env)}
            </span>

            <span>·</span>

            <span class="mono">
              ${escapeHtml(x.version)}
            </span>

            <span>·</span>

            <span>
              Detected ${escapeHtml(x.time)}
            </span>

          </div>

        </div>


        <button
          class="btn ghost"
          onclick="
            viewIncident(
              ${incidents.indexOf(x)}
            )
          "
        >
          Open incident
        </button>

      </div>


      ${flow(x)}

    </section>

  `;

}


/* ============================================================
   CHART BARS
   ============================================================ */

function bars(rows, color) {

  const max =
    Math.max(
      ...rows.map(row => row[1]),
      1
    );


  return `

    <div class="bars">

      ${
        rows.map(
          row => `

            <div class="bar">

              <span>
                ${escapeHtml(row[0])}
              </span>


              <i
                style="
                  --w:${row[1] / max * 100}%;
                  --c:var(--${row[2] || color || 'blu'})
                "
              ></i>


              <b>
                ${row[1]}${row[3] || ''}
              </b>

            </div>

          `
        ).join('')
      }

    </div>

  `;

}


/* ============================================================
   CHARTS
   ============================================================ */

function charts() {

  const critical =
    incidents.filter(
      incident =>
        incident.severity === 'Critical'
    ).length;


  const warning =
    incidents.length -
    critical;


  const services = {};


  incidents.forEach(
    incident => {

      services[incident.service] =
        (services[incident.service] || 0) + 1;

    }
  );


  const resolved =
    incidents.filter(
      incident =>
        incident.mttr
    );


  return `

    <div class="grid3">

      <section class="card">

        <div class="card-h">

          <h3>
            Incidents by severity
          </h3>

        </div>


        <div class="pad">

          <div class="stackbar">

            <i
              style="
                flex:${critical};
                --c:var(--red)
              "
            ></i>


            <i
              style="
                flex:${warning};
                --c:var(--amb)
              "
            ></i>

          </div>


          <div class="legend">

            <span>

              ${chip(
                'Critical',
                'red'
              )}

              <b>
                ${critical}
              </b>

            </span>


            <span>

              ${chip(
                'Warning',
                'amb'
              )}

              <b>
                ${warning}
              </b>

            </span>

          </div>

        </div>

      </section>


      <section class="card">

        <div class="card-h">

          <h3>
            Incidents by service
          </h3>

        </div>


        ${bars(
          Object.entries(services)
            .sort(
              (a, b) =>
                b[1] - a[1]
            )
            .map(
              entry =>
                [
                  entry[0],
                  entry[1]
                ]
            ),
          'blu'
        )}

      </section>


      <section class="card">

        <div class="card-h">

          <h3>
            Resolution time
          </h3>


          <span
            class="sub"
            style="
              margin:0;
              font-size:12px
            "
          >
            minutes
          </span>

        </div>


        ${bars(
          resolved.map(
            incident => [

              incident.id,

              incident.mttr,

              incident.mttr > 40
                ? 'amb'
                : 'grn',

              'm'

            ]
          )
        )}

      </section>

    </div>

  `;

}


/* ============================================================
   HOME PAGE
   ============================================================ */

function home() {

  const current =
    active();


  const open =
    incidents.filter(
      incident =>
        incident.status !== 'Resolved'
    ).length;


  const statuses = [

    'API Healthy',

    'Memory Online',

    'Hindsight Connected',

    'Investigation Agent Ready'

  ];


  main.innerHTML = `

    <div class="pg-h">

      <div>

        <h1>
          Incident Command Center
        </h1>


        <p class="sub">

          AI-Powered Incident Intelligence ·
          ${open} open incidents

        </p>

      </div>


      <span class="sub mono">
        Tue · Sep 29, 2026
      </span>

    </div>


    <div class="strip">

      ${
        statuses.map(
          status => `

            <div>

              <i class="dot"></i>

              ${escapeHtml(status)}

            </div>

          `
        ).join('')
      }

    </div>


    ${activeCard(current)}


    <div class="grid2">

      <div class="stack">

        ${panel(current)}

        ${trail(current)}

      </div>


      <div class="stack">

        ${activity(current)}

        ${timeline(current)}

        ${attempts(current)}

      </div>

    </div>


    ${charts()}

  `;

}


/* ============================================================
   INCIDENT LIST
   ============================================================ */

function cards() {

  const query =
    F.q.toLowerCase();


  const list =
    incidents.filter(
      incident => {

        const matchesSearch =
          `
            ${incident.id}
            ${incident.service}
            ${incident.error}
            ${incident.root}
          `
            .toLowerCase()
            .includes(query);


        const matchesFilter =

          F.f === 'all' ||

          (
            F.f === 'active' &&
            incident.status !== 'Resolved'
          ) ||

          (
            F.f === 'resolved' &&
            incident.status === 'Resolved'
          ) ||

          (
            F.f === 'critical' &&
            incident.severity === 'Critical'
          ) ||

          (
            F.f === 'warning' &&
            incident.severity === 'Warning'
          );


        const matchesService =
          F.svc === 'all' ||
          incident.service === F.svc;


        return (
          matchesSearch &&
          matchesFilter &&
          matchesService
        );

      }
    );


  if (!list.length) {

    return `

      <div class="card state">

        ${ic('search', 22)}

        <h3>
          No incidents match
        </h3>

        <p>
          Try a different search term
          or clear the filters.
        </p>

      </div>

    `;

  }


  return `

    <div class="list">

      ${
        list.map(
          incident => `

            <article class="card inc">

              <div class="inc-top">

                <div>

                  <span class="id sub">

                    ${escapeHtml(
                      incident.id
                    )}

                  </span>


                  <h3>

                    ${escapeHtml(
                      incident.service
                    )}

                    ·

                    ${escapeHtml(
                      incident.error
                    )}

                  </h3>

                </div>


                <div class="hd">

                  ${chip(
                    incident.severity,
                    sevC(incident)
                  )}


                  ${chip(
                    incident.status,
                    stC(incident)
                  )}

                </div>

              </div>


              <dl class="mini">

                <div>

                  <dt>
                    Root cause
                  </dt>

                  <dd>
                    ${escapeHtml(
                      incident.root
                    )}
                  </dd>

                </div>


                <div>

                  <dt>
                    Failed attempt
                  </dt>

                  <dd>
                    ${escapeHtml(
                      incident.failed
                    )}
                  </dd>

                </div>


                <div>

                  <dt>
                    Successful fix
                  </dt>

                  <dd>
                    ${escapeHtml(
                      incident.fix
                    )}
                  </dd>

                </div>


                <div>

                  <dt>
                    Lesson
                  </dt>

                  <dd>
                    ${escapeHtml(
                      incident.lesson
                    )}
                  </dd>

                </div>

              </dl>


              <div class="inc-foot">

                <span>

                  ${escapeHtml(
                    incident.date
                  )}

                  ·

                  ${escapeHtml(
                    incident.time
                  )}

                </span>


                <button
                  class="btn sm ghost"
                  onclick="
                    viewIncident(
                      ${incidents.indexOf(incident)}
                    )
                  "
                >
                  View
                </button>

              </div>

            </article>

          `
        ).join('')
      }

    </div>

  `;

}


/* ============================================================
   INCIDENTS PAGE
   ============================================================ */

function incidentsPage() {

  const services =
    [
      ...new Set(
        incidents.map(
          incident =>
            incident.service
        )
      )
    ];


  const filters = [

    ['all', 'All'],

    ['active', 'Active'],

    ['resolved', 'Resolved'],

    ['critical', 'Critical'],

    ['warning', 'Warnings']

  ];


  main.innerHTML = `

    <div class="pg-h">

      <div>

        <h1>
          Incidents
        </h1>


        <p class="sub">

          What is happening,
          what failed before,
          and what worked.

        </p>

      </div>


      <button
        class="btn"
        onclick="openNewIncidentForm()"
      >
        New incident
      </button>

    </div>


    <div class="toolbar">

      <div
        class="search"
        style="
          max-width:320px;
          flex:1 1 220px
        "
      >

        <input
          id="incident-search"
          value="${escapeHtml(F.q)}"
          placeholder="Search by service, error, or ID"
          oninput="filterIncidents(this.value)"
          aria-label="Search incidents"
        >

      </div>


      <div
        class="toolbar"
        id="filters"
      >

        ${
          filters.map(
            filter => `

              <button
                class="
                  pill
                  ${
                    F.f === filter[0]
                      ? 'on'
                      : ''
                  }
                "
                onclick="
                  F.f='${filter[0]}';
                  incidentsPage()
                "
              >
                ${filter[1]}
              </button>

            `
          ).join('')
        }

      </div>


      <select
        class="pill"
        aria-label="Service"
        onchange="
          F.svc=this.value;
          filterIncidents(F.q)
        "
      >

        <option value="all">
          Service: all
        </option>


        ${
          services.map(
            service => `

              <option
                value="${escapeHtml(service)}"
                ${
                  F.svc === service
                    ? 'selected'
                    : ''
                }
              >
                ${escapeHtml(service)}
              </option>

            `
          ).join('')
        }

      </select>

    </div>


    <div id="incident-list">

      ${cards()}

    </div>

  `;

}


/* ============================================================
   FILTER INCIDENTS
   ============================================================ */

function filterIncidents(query) {

  F.q = query;


  const list =
    document.querySelector(
      '#incident-list'
    );


  if (list) {

    list.innerHTML =
      cards();

  }

}


/* ============================================================
   MEMORY PAGE
   ============================================================ */

function memoryPage() {

  const resolved =
    incidents.filter(
      incident =>
        incident.status === 'Resolved'
    );


  main.innerHTML = `

    <div>

      <h1>
        Historical Intelligence
      </h1>


      <p class="sub">

        Past incidents,
        what failed,
        and what worked —
        brought back when a familiar
        problem returns.

      </p>

    </div>


    <div class="grid2">

      <div
        class="list"
        style="
          grid-template-columns:1fr
        "
      >

        ${
          resolved.map(
            incident => `

              <article class="card inc">

                <div class="inc-top">

                  <div>

                    <span class="id sub">

                      ${escapeHtml(
                        incident.id
                      )}

                    </span>


                    <h3>

                      ${escapeHtml(
                        incident.service
                      )}

                      ·

                      ${escapeHtml(
                        incident.error
                      )}

                    </h3>

                  </div>


                  ${chip(
                    'Resolved',
                    'grn'
                  )}

                </div>


                <dl class="mini">

                  <div>

                    <dt>
                      Root cause
                    </dt>

                    <dd>
                      ${escapeHtml(
                        incident.root
                      )}
                    </dd>

                  </div>


                  <div>

                    <dt>
                      Failed attempt
                    </dt>

                    <dd>
                      ${escapeHtml(
                        incident.failed
                      )}
                    </dd>

                  </div>


                  <div>

                    <dt>
                      Successful fix
                    </dt>

                    <dd>
                      ${escapeHtml(
                        incident.fix
                      )}
                    </dd>

                  </div>


                  <div>

                    <dt>
                      Lesson
                    </dt>

                    <dd>
                      ${escapeHtml(
                        incident.lesson
                      )}
                    </dd>

                  </div>

                </dl>


                <div class="inc-foot">

                  <span>
                    ${escapeHtml(
                      incident.date
                    )}
                  </span>


                  <button
                    class="btn sm ghost"
                    onclick="
                      askAbout(
                        '${escapeHtml(
                          incident.service
                        )}'
                      )
                    "
                  >
                    Use memory
                  </button>

                </div>

              </article>

            `
          ).join('')
        }

      </div>


      <div class="stack">

        ${trail(
          incidents.find(
            incident =>
              incident.id === 'INC-001'
          ) || incidents[1]
        )}

      </div>

    </div>

  `;

}


/* ============================================================
   RESOLUTIONS PAGE
   ============================================================ */

function resolutionsPage() {

  const resolved =
    incidents.filter(
      incident =>
        incident.status === 'Resolved'
    );


  const validMttr =
    resolved.filter(
      incident =>
        typeof incident.mttr === 'number'
    );


  const average =
    validMttr.length

      ? Math.round(
          validMttr.reduce(
            (total, incident) =>
              total + incident.mttr,
            0
          ) / validMttr.length
        )

      : 0;


  main.innerHTML = `

    <div>

      <h1>
        Resolutions
      </h1>


      <p class="sub">

        ${resolved.length}
        resolved incidents ·
        average
        ${average}
        minutes to resolve

      </p>

    </div>


    ${charts()}


    <div class="list">

      ${
        resolved.map(
          incident => `

            <article class="card inc">

              <div class="inc-top">

                <div>

                  <span class="id sub">

                    ${escapeHtml(
                      incident.id
                    )}

                  </span>


                  <h3>

                    ${escapeHtml(
                      incident.fix
                    )}

                  </h3>

                </div>


                ${chip(
                  `${incident.mttr} min`,
                  'grn'
                )}

              </div>


              ${attemptsMini(incident)}

            </article>

          `
        ).join('')
      }

    </div>

  `;

}


/* ============================================================
   MINI ATTEMPTS
   ============================================================ */

function attemptsMini(x) {

  return `

    <dl class="mini">

      <div>

        <dt>
          Did not work
        </dt>

        <dd>

          ${ic('x', 13)}

          ${escapeHtml(
            x.failed
          )}

        </dd>

      </div>


      <div>

        <dt>
          Lesson
        </dt>

        <dd>
          ${escapeHtml(
            x.lesson
          )}
        </dd>

      </div>

    </dl>

  `;

}


/* ============================================================
   SETTINGS
   ============================================================ */

const SET = [

  [
    'memory',
    'Historical memory',
    'Search past incidents during an investigation'
  ],

  [
    'hints',
    'Investigation hints',
    'Show recommended verification steps'
  ],

  [
    'notify',
    'Incident notifications',
    'Notify the team when a critical incident opens'
  ],

  [
    'quiet',
    'Reduced motion presentation',
    'Skip loading transitions for long review sessions'
  ]

];


function settingsPage() {

  main.innerHTML = `

    <div>

      <h1>
        System
      </h1>


      <p class="sub">

        Connections and workspace behavior.

      </p>

    </div>


    <div class="strip">

      ${
        [
          'API Healthy',
          'Memory Online',
          'Hindsight Connected',
          'Agent Ready'
        ].map(
          status => `

            <div>

              <i class="dot"></i>

              ${escapeHtml(status)}

            </div>

          `
        ).join('')
      }

    </div>


    <div class="card">

      ${
        SET.map(
          setting => `

            <div class="setting">

              <div>

                <b>
                  ${escapeHtml(
                    setting[1]
                  )}
                </b>


                <small>
                  ${escapeHtml(
                    setting[2]
                  )}
                </small>

              </div>


              <button
                class="
                  toggle
                  ${
                    S[setting[0]]
                      ? 'on'
                      : ''
                  }
                "
                role="switch"
                aria-checked="${
                  S[setting[0]]
                }"
                aria-label="${
                  escapeHtml(
                    setting[1]
                  )
                }"
                onclick="
                  S.${setting[0]}=
                  !S.${setting[0]};

                  if(S.memory)
                    S.skip=false;

                  this.classList.toggle(
                    'on'
                  );

                  this.setAttribute(
                    'aria-checked',
                    S.${setting[0]}
                  );
                "
              >

                <i></i>

              </button>

            </div>

          `
        ).join('')
      }

    </div>

  `;

}


/* ============================================================
   INCIDENT DETAIL
   ============================================================ */

function incidentDetail(x) {

  if (!x) {

    main.innerHTML = `

      <div class="card state">

        ${ic('alert', 22)}

        <h3>
          Incident not found
        </h3>

        <button
          class="btn"
          onclick="showPage('incidents')"
        >
          Back to incidents
        </button>

      </div>

    `;

    return;
  }


  main.innerHTML = `

    <div>

      <button
        class="btn sm ghost"
        onclick="
          showPage('incidents')
        "
      >
        ← All incidents
      </button>

    </div>


    ${activeCard(x)}


    <div class="grid2">

      <div class="stack">

        <section class="card pad">

          <h3>
            Incident overview
          </h3>


          <dl class="kv">

            <div>

              <dt>
                Service
              </dt>

              <dd>
                ${escapeHtml(x.service)}
              </dd>

            </div>


            <div>

              <dt>
                Error
              </dt>

              <dd>
                ${escapeHtml(x.error)}
              </dd>

            </div>


            <div>

              <dt>
                Environment
              </dt>

              <dd>
                ${escapeHtml(x.env)}
              </dd>

            </div>


            <div>

              <dt>
                Deployment
              </dt>

              <dd class="mono">
                ${escapeHtml(x.version)}
              </dd>

            </div>


            <div>

              <dt>
                Detected
              </dt>

              <dd>

                ${escapeHtml(x.date)}
                ·
                ${escapeHtml(x.time)}

              </dd>

            </div>


            <div>

              <dt>
                Root cause
              </dt>

              <dd>
                ${escapeHtml(x.root)}
              </dd>

            </div>

          </dl>


          <div
            class="row"
            style="
              justify-content:flex-start;
              margin-top:14px
            "
          >

            <button
              class="btn sm ghost"
              onclick="
                showToast(
                  'Incident notes panel opened.'
                )
              "
            >
              Add note
            </button>


            <button
              class="btn sm"
              onclick="
                resolveIncident(
                  '${escapeHtml(x.id)}'
                )
              "
            >

              ${
                x.status === 'Resolved'
                  ? 'Re-open incident'
                  : 'Mark resolved'
              }

            </button>

          </div>

        </section>


        ${panel(x)}


        ${timeline(x)}

      </div>


      <div class="stack">

        ${activity(x)}


        ${
          rel(x)

            ? `

              <section class="card">

                <div class="card-h">

                  <h3>
                    Related historical incident
                  </h3>

                </div>


                <div class="pad">

                  <span class="id sub">

                    ${escapeHtml(
                      rel(x).id
                    )}

                  </span>


                  <p>

                    <b>

                      ${escapeHtml(
                        rel(x).service
                      )}

                      ·

                      ${escapeHtml(
                        rel(x).error
                      )}

                    </b>

                  </p>


                  <button
                    class="btn sm ghost"
                    style="
                      margin-top:10px
                    "
                    onclick="
                      viewIncident(
                        ${incidents.indexOf(
                          rel(x)
                        )}
                      )
                    "
                  >
                    Open
                    ${escapeHtml(
                      rel(x).id
                    )}
                  </button>

                </div>

              </section>

            `

            : ''
        }


        ${attempts(x)}


        ${trail(x)}

      </div>

    </div>

  `;

}


/* ============================================================
   ROUTING
   ============================================================ */

const skel = message => `

  <div class="skel">

    <p
      class="sk-msg"
      id="sk"
    >
      ${escapeHtml(message)}
    </p>


    <div></div>

    <div></div>

    <div></div>

  </div>

`;


function showPage(
  page,
  argument,
  keep
) {

  cur = {
    p: page,
    a: argument
  };


  document.body.classList.remove(
    'nav-open'
  );


  const nav =
    page === 'detail'
      ? 'incidents'
      : page;


  document
    .querySelectorAll('.nav-item')
    .forEach(
      button =>
        button.classList.toggle(
          'active',
          button.dataset.page === nav
        )
    );


  const x =
    page === 'investigation'
      ? active()

      : page === 'detail'
        ? byId(argument)

        : null;


  const pageFunctions = {

    home,

    incidents:
      incidentsPage,

    memory:
      memoryPage,

    resolutions:
      resolutionsPage,

    settings:
      settingsPage,

    investigation:
      () => incidentDetail(x),

    detail:
      () => incidentDetail(x)

  };


  const render =
    pageFunctions[page] ||
    home;


  if (!keep) {

    window.scrollTo({
      top: 0
    });

  }


  if (
    x &&
    !keep &&
    !S.quiet
  ) {

    const token =
      ++tok;


    const messages = [

      'Searching historical incidents...',

      'Retrieving relevant memory...',

      'Comparing previous outcomes...',

      'Preparing investigation recommendation...'

    ];


    main.innerHTML =
      skel(messages[0]);


    messages.forEach(
      (message, index) => {

        setTimeout(
          () => {

            if (token !== tok) {
              return;
            }


            const element =
              document.querySelector(
                '#sk'
              );


            if (element) {

              element.textContent =
                message;

            }

          },
          index * 260
        );

      }
    );


    setTimeout(
      () => {

        if (token === tok) {

          render();

        }

      },
      messages.length * 260
    );


  } else {

    tok++;

    render();

  }

}


/* ============================================================
   REFRESH
   ============================================================ */

function refresh() {

  showPage(
    cur.p,
    cur.a,
    true
  );

}


/* ============================================================
   VIEW INCIDENT
   ============================================================ */

function viewIncident(index) {

  const incident =
    incidents[index];


  if (!incident) {
    return;
  }


  showPage(
    'detail',
    incident.id
  );


  addMessage(
    'user',
    `Open ${escapeHtml(incident.id)}`
  );


  addMessage(
    'ai',
    `
      Opened
      <strong>
        ${escapeHtml(incident.id)}
      </strong>

      —
      ${escapeHtml(incident.service)},
      ${escapeHtml(incident.error)}.

      ${
        incident.related

          ? `
            Related incident:
            <strong>
              ${escapeHtml(
                incident.related
              )}
            </strong>.
          `

          : ''
      }

    `
  );

}


/* ============================================================
   RESOLVE INCIDENT
   ============================================================
   NOTE:
   Currently updates frontend state only.

   Your current Spring Boot PUT endpoint does not yet
   accept/update the status field.
   ============================================================ */

function resolveIncident(id) {

  const incident =
    byId(id);


  if (!incident) {
    return;
  }


  incident.status =
    incident.status === 'Resolved'
      ? 'Investigating'
      : 'Resolved';


  const openCount =
    incidents.filter(
      item =>
        item.status !== 'Resolved'
    ).length;


  const openCountElement =
    document.querySelector(
      '#open-count'
    );


  if (openCountElement) {

    openCountElement.textContent =
      openCount;

  }


  showToast(

    incident.status === 'Resolved'

      ? 'Incident marked resolved.'

      : 'Incident re-opened.'

  );


  refresh();

}


/* ============================================================
   ASK TRACEIQ
   ============================================================ */

function addMessage(
  type,
  html
) {

  if (!chat) {
    return;
  }


  chat.insertAdjacentHTML(
    'beforeend',

    `
      <div class="msg ${type}">

        <div class="bubble">

          ${html}

        </div>

      </div>
    `

  );


  chat.scrollTop =
    chat.scrollHeight;

}


/* ============================================================
   LOCAL TRACEIQ ASSISTANT
   ============================================================ */

function assistantResponse(text) {

  const query =
    String(text).toLowerCase();


  let incident = null;


  if (
    /payment|503/.test(query)
  ) {

    incident =
      incidents.find(
        item =>
          item.service === 'Payment API'
      );

  }

  else if (
    /search|latency/.test(query)
  ) {

    incident =
      incidents.find(
        item =>
          item.service === 'Search API'
      );

  }

  else if (
    /notif|queue/.test(query)
  ) {

    incident =
      incidents.find(
        item =>
          item.service === 'Notification Worker'
      );

  }

  else if (
    /inventory|409/.test(query)
  ) {

    incident =
      incidents.find(
        item =>
          item.service === 'Inventory API'
      );

  }

  else if (
    /order|401|auth/.test(query)
  ) {

    incident =
      incidents.find(
        item =>
          item.service === 'Order API'
      );

  }


  if (!incident) {

    addMessage(
      'ai',
      `

        <div class="bubble-label">
          Ready to investigate
        </div>


        Tell me the

        <strong>
          service
        </strong>,

        <strong>
          error code
        </strong>,

        or what changed recently.


        I'll search incident history
        for related failures.

      `
    );


    return;

  }


  const historical =
    rel(incident) ||
    (
      incident.status === 'Resolved'
        ? incident
        : null
    );


  if (!historical) {

    addMessage(
      'ai',
      `

        <div class="bubble-label">
          No historical evidence found
        </div>


        No sufficiently similar
        previous incident for

        <strong>
          ${escapeHtml(
            incident.service
          )}
        </strong>.


        <div class="steps">

          Recommended verification:

          ${escapeHtml(
            incident.verify
          )}

        </div>

      `
    );


    return;

  }


  addMessage(
    'ai',
    `

      <div class="bubble-label">
        Historical evidence
      </div>


      <strong>
        ${escapeHtml(
          historical.id
        )}
      </strong>

      —

      ${escapeHtml(
        historical.service
      )},

      ${escapeHtml(
        historical.error
      )}.


      <dl class="mini">

        <div>

          <dt>
            Root cause
          </dt>

          <dd>
            ${escapeHtml(
              historical.root
            )}
          </dd>

        </div>


        <div>

          <dt>
            Failed attempt
          </dt>

          <dd>
            ${escapeHtml(
              historical.failed
            )}
          </dd>

        </div>


        <div>

          <dt>
            Successful fix
          </dt>

          <dd>
            ${escapeHtml(
              historical.fix
            )}
          </dd>

        </div>


        <div>

          <dt>
            Lesson
          </dt>

          <dd>
            ${escapeHtml(
              historical.lesson
            )}
          </dd>

        </div>

      </dl>


      <div class="steps">

        Not yet verified for the
        current incident.


        Recommended verification:

        ${escapeHtml(
          incident.verify
        )}

      </div>

    `
  );

}


/* ============================================================
   ASK ABOUT MEMORY
   ============================================================ */

function askAbout(service) {

  openDrawer();


  addMessage(
    'user',
    `Use memory for ${escapeHtml(service)}`
  );


  setTimeout(
    () =>
      assistantResponse(service),
    250
  );

}


/* ============================================================
   DRAWER
   ============================================================ */

function openDrawer() {

  const drawer =
    document.querySelector(
      '#drawer'
    );


  if (drawer) {

    drawer.classList.add(
      'open'
    );

  }

}


/* ============================================================
   DRAWER BUTTONS
   ============================================================ */

const askButton =
  document.querySelector(
    '#ask-btn'
  );


if (askButton) {

  askButton.onclick =
    openDrawer;

}


const drawerClose =
  document.querySelector(
    '#drawer-close'
  );


if (drawerClose) {

  drawerClose.onclick =
    () => {

      const drawer =
        document.querySelector(
          '#drawer'
        );


      if (drawer) {

        drawer.classList.remove(
          'open'
        );

      }

    };

}


/* ============================================================
   CHAT FORM
   ============================================================ */

const chatForm =
  document.querySelector(
    '#chat-form'
  );


if (chatForm) {

  chatForm.addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const input =
        document.querySelector(
          '#message'
        );


      if (!input) {
        return;
      }


      const text =
        input.value.trim();


      if (!text) {
        return;
      }


      addMessage(
        'user',
        escapeHtml(text)
      );


      input.value = '';


      setTimeout(
        () =>
          assistantResponse(text),
        350
      );

    }
  );

}


/* ============================================================
   SUGGESTION BUTTONS
   ============================================================ */

document
  .querySelectorAll(
    '.suggest button'
  )
  .forEach(
    button => {

      button.onclick =
        () => {

          const action =
            button.dataset.action;


          if (action === 'similar') {

            addMessage(
              'user',
              'Find similar incidents'
            );


            assistantResponse(
              'Payment 503'
            );

          }


          if (action === 'failed') {

            addMessage(
              'user',
              'What failed before?'
            );


            assistantResponse(
              'Payment 503'
            );

          }


          if (action === 'steps') {

            addMessage(
              'user',
              'Give me an investigation plan'
            );


            addMessage(
              'ai',

              `

                <div class="bubble-label">
                  Investigation plan
                </div>


                <ol class="steps">

                  <li>
                    Check error rate,
                    latency and saturation
                    for the affected service.
                  </li>


                  <li>
                    Review deployments and
                    config changes from the last hour.
                  </li>


                  <li>
                    Compare the signal with
                    related incidents in memory.
                  </li>


                  <li>
                    Validate the historical fix
                    safely before rollout.
                  </li>

                </ol>

              `

            );

          }

        };

    }
  );


/* ============================================================
   SHELL WIRING
   ============================================================ */

document
  .querySelectorAll('[data-ic]')
  .forEach(
    element => {

      element.innerHTML =
        ic(
          element.dataset.ic,
          18
        );

    }
  );


document
  .querySelectorAll(
    '.nav-item, .brand'
  )
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () =>
          showPage(
            button.dataset.page
          )
      );


      button.addEventListener(
        'keydown',
        event => {

          if (
            event.key === 'Enter'
          ) {

            showPage(
              button.dataset.page
            );

          }

        }
      );

    }
  );


/* ============================================================
   MOBILE MENU
   ============================================================ */

const menuButton =
  document.querySelector(
    '#menu-btn'
  );


if (menuButton) {

  menuButton.onclick =
    () => {

      if (
        matchMedia(
          '(max-width:860px)'
        ).matches
      ) {

        document.body.classList.toggle(
          'nav-open'
        );

      } else {

        document.body.classList.toggle(
          'collapsed'
        );

      }

    };

}


const scrim =
  document.querySelector(
    '#scrim'
  );


if (scrim) {

  scrim.onclick =
    () =>
      document.body.classList.remove(
        'nav-open'
      );

}


/* ============================================================
   HEADER SEARCH
   ============================================================ */

const headerSearch =
  document.querySelector(
    '#hsearch'
  );


if (headerSearch) {

  headerSearch.addEventListener(
    'submit',
    event => {

      event.preventDefault();


      const input =
        document.querySelector(
          '#hsearch-input'
        );


      if (!input) {
        return;
      }


      F.q =
        input.value.trim();


      showPage(
        'incidents'
      );

    }
  );

}


/* ============================================================
   THEME
   ============================================================ */

function applyTraceiqTheme(
  theme,
  announce
) {

  const selectedTheme =
    theme === 'dark'
      ? 'dark'
      : 'light';


  const root =
    document.documentElement;


  root.classList.add(
    'tt'
  );


  clearTimeout(
    applyTraceiqTheme.t
  );


  applyTraceiqTheme.t =
    setTimeout(
      () =>
        root.classList.remove(
          'tt'
        ),
      350
    );


  root.dataset.theme =
    selectedTheme;


  try {

    localStorage.setItem(
      'traceiq-theme',
      selectedTheme
    );

  } catch (error) {
    // Ignore localStorage errors
  }


  document
    .querySelectorAll(
      '[data-theme-choice]'
    )
    .forEach(
      button => {

        const selected =
          button.dataset.themeChoice ===
          selectedTheme;


        button.classList.toggle(
          'selected',
          selected
        );


        button.setAttribute(
          'aria-pressed',
          selected
        );

      }
    );


  const themeMeta =
    document.querySelector(
      'meta[name="theme-color"]'
    );


  if (themeMeta) {

    themeMeta.content =
      selectedTheme === 'dark'
        ? '#0c0e11'
        : '#f5f6f8';

  }


  if (announce) {

    showToast(
      `${
        selectedTheme === 'dark'
          ? 'Dark'
          : 'Light'
      } mode selected.`
    );

  }

}


/* ============================================================
   THEME BUTTONS
   ============================================================ */

document
  .querySelectorAll(
    '[data-theme-choice]'
  )
  .forEach(
    button => {

      button.addEventListener(
        'click',
        () =>
          applyTraceiqTheme(
            button.dataset.themeChoice,
            true
          )
      );

    }
  );


applyTraceiqTheme(
  document.documentElement.dataset.theme
);


/* ============================================================
   INITIALIZE TRACEIQ
   ============================================================ */

const initialOpenCount =
  incidents.filter(
    incident =>
      incident.status !== 'Resolved'
  ).length;


const initialOpenElement =
  document.querySelector(
    '#open-count'
  );


if (initialOpenElement) {

  initialOpenElement.textContent =
    initialOpenCount;

}


/* ============================================================
   START HOME PAGE
   ============================================================ */

showPage(
  'home'
);


/* ============================================================
   INITIAL ASK TRACEIQ MESSAGE
   ============================================================ */

addMessage(
  'ai',

  `

    <div class="bubble-label">
      Ask TraceIQ
    </div>


    Try

    <strong>
      payment 503
    </strong>,

    <strong>
      search latency
    </strong>

    or

    <strong>
      inventory 409
    </strong>

    —

    I'll bring back the closest
    incident memory.

  `

);


/* ============================================================
   TEST BACKEND CONNECTIONS
   ============================================================ */

testTraceIQConnections();