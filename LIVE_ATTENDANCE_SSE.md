# Live Attendance with Server-Sent Events (SSE)

## Overview
The live attendance monitoring system uses Server-Sent Events (SSE) to push real-time updates to connected clients whenever employees check in or check out.

## Architecture

### Components Added
1. **SSEService** (`src/services/sse.service.ts`) - Manages SSE client connections and broadcasts events
2. **SSE Controller Method** (`src/controllers/attendance.controller.ts::streamLiveAttendance`) - Handles SSE connection setup
3. **SSE Route** (`GET /api/attendance/live-stream`) - Endpoint for establishing SSE connections
4. **SSE Event Constants** (`src/constants/attendance.constants.ts`) - Event types and interfaces

### Event Flow
```
Employee Check-In/Out
    ↓
AttendanceService.checkIn/checkOut()
    ↓
Save to Database
    ↓
SSEService.broadcastCheckIn/CheckOut()
    ↓
Push to all connected clients
    ↓
Frontend receives real-time update
```

## API Endpoint

### Connect to Live Stream
```http
GET /api/attendance/live-stream?department=IT
```

**Query Parameters:**
- `department` (optional) - Filter events by department

**Response Headers:**
- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

## SSE Events

### 1. Connection Event
Sent immediately when client connects.

```javascript
event: connected
data: {
  "message": "Connected to live attendance stream",
  "clientId": "client_1234567890_abc123",
  "timestamp": "2025-12-24T01:16:00.000Z"
}
```

### 2. Initial Summary
Sent once on connection with current attendance state.

```javascript
event: initial-summary
data: {
  "summary": {
    "totalStaff": 20,
    "checkedIn": 8,
    "checkedOut": 7,
    "notMarked": 3,
    "onLeave": 2,
    "present": 15,
    "attendancePercent": 88
  },
  "records": [
    {
      "empId": "EMP-001",
      "name": "John Doe",
      "department": "Finance",
      "position": "Senior Accountant",
      "checkIn": "08:45:23",
      "checkOut": "",
      "hoursWorked": 0,
      "status": "Present",
      "salaryStatus": "Full",
      "deductionAmount": 0,
      "salaryForDay": 195.65
    },
    {
      "empId": "EMP-002",
      "name": "Jane Smith",
      "checkIn": "",
      "checkOut": "",
      "hoursWorked": 0,
      "status": "Absent",
      "salaryStatus": "Zero",
      "deductionAmount": 0,
      "salaryForDay": 0
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 20,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "filters": {
    "date": "2025-12-24",
    "status": null,
    "department": null
  },
  "timestamp": "2025-12-24T01:16:00.000Z"
}
```

### 3. Check-In Event
Broadcast when employee checks in.

```javascript
event: check-in
data: {
  "empId": "USM-001",
  "name": "Ahmed Al-Rashid",
  "department": "Finance",
  "checkInTime": "08:45:23",
  "timestamp": "2025-12-24T01:16:00.000Z"
}
```

### 4. Check-Out Event
Broadcast when employee checks out.

```javascript
event: check-out
data: {
  "empId": "USM-002",
  "name": "Sarah Johnson",
  "department": "Operations",
  "checkOutTime": "17:30:28",
  "hoursWorked": 8.56,
  "timestamp": "2025-12-24T01:16:00.000Z"
}
```

### 5. Summary Update Event
Broadcast after each check-in/out with updated counts and the affected employee's record.

```javascript
event: summary-update
data: {
  "summary": {
    "totalStaff": 20,
    "checkedIn": 8,
    "checkedOut": 7,
    "notMarked": 3,
    "onLeave": 2,
    "present": 15,
    "attendancePercent": 88
  },
  "updatedRecord": {
    "empId": "EMP-003",
    "name": "John Doe",
    "department": "Finance",
    "position": "Engineer",
    "checkIn": "08:45:23",
    "checkOut": "",
    "hoursWorked": 0,
    "status": "Present",
    "salaryStatus": "Full",
    "deductionAmount": 0,
    "salaryForDay": 195.65
  },
  "timestamp": "2025-12-24T01:16:00.000Z"
}
```

### 6. Heartbeat
Sent every 30 seconds to keep connection alive.

```javascript
: heartbeat 2025-12-24T01:16:00.000Z
```

## Frontend Integration

### JavaScript/TypeScript Example

```typescript
// Connect to SSE endpoint
const eventSource = new EventSource('http://localhost:4000/api/attendance/live-stream');

// Handle connection
eventSource.addEventListener('connected', (event) => {
  const data = JSON.parse(event.data);
  console.log('Connected:', data.message);
});

// Handle initial summary
eventSource.addEventListener('initial-summary', (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data.summary);
});

// Handle check-in events
eventSource.addEventListener('check-in', (event) => {
  const data = JSON.parse(event.data);
  console.log(`${data.name} checked in at ${data.checkInTime}`);
  showNotification(`${data.name} checked in`, 'success');
});

// Handle check-out events
eventSource.addEventListener('check-out', (event) => {
  const data = JSON.parse(event.data);
  console.log(`${data.name} checked out at ${data.checkOutTime}`);
  showNotification(`${data.name} checked out (${data.hoursWorked}h)`, 'info');
});

// Handle summary updates
eventSource.addEventListener('summary-update', (event) => {
  const data = JSON.parse(event.data);
  updateSummaryCards(data.summary);
  
  // Update the specific employee record in the table if provided
  if (data.updatedRecord) {
    updateEmployeeRow(data.updatedRecord);
  }
});

// Handle errors
eventSource.onerror = (error) => {
  console.error('SSE Error:', error);
  eventSource.close();
  // Implement reconnection logic
  setTimeout(() => {
    connectToSSE(); // Reconnect after 5 seconds
  }, 5000);
};

// Cleanup on component unmount
function cleanup() {
  eventSource.close();
}
```

### React Example

```typescript
import { useEffect, useState } from 'react';

function LiveAttendanceDashboard() {
  const [summary, setSummary] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource(
      'http://localhost:4000/api/attendance/live-stream'
    );

    eventSource.addEventListener('initial-summary', (event) => {
      const data = JSON.parse(event.data);
      setSummary(data.summary);
    });

    eventSource.addEventListener('check-in', (event) => {
      const data = JSON.parse(event.data);
      setRecentEvents(prev => [
        { type: 'check-in', ...data },
        ...prev.slice(0, 9)
      ]);
    });

    eventSource.addEventListener('check-out', (event) => {
      const data = JSON.parse(event.data);
      setRecentEvents(prev => [
        { type: 'check-out', ...data },
        ...prev.slice(0, 9)
      ]);
    });

    eventSource.addEventListener('summary-update', (event) => {
      const data = JSON.parse(event.data);
      setSummary(data.summary);
      
      // Update the specific employee record if provided  
      if (data.updatedRecord) {
        setRecentEvents(prev => [
          { type: 'update', ...data.updatedRecord },
          ...prev.slice(0, 9)
        ]);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      {summary && (
        <div className="summary-cards">
          <Card title="Total Staff" value={summary.totalStaff} />
          <Card title="Checked In" value={summary.checkedIn} />
          <Card title="Checked Out" value={summary.checkedOut} />
          <Card title="Not Marked" value={summary.notMarked} />
          <Card title="On Leave" value={summary.onLeave} />
        </div>
      )}
      
      <div className="recent-events">
        <h3>Live Updates</h3>
        {recentEvents.map((event, i) => (
          <div key={i} className={`event event-${event.type}`}>
            {event.name} - {event.type === 'check-in' ? 'In' : 'Out'} at {event.checkInTime || event.checkOutTime}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Features

### ✅ Implemented
- Real-time check-in/check-out notifications
- Live summary updates (counts and percentages)
- Automatic heartbeat (30s interval) to keep connections alive
- Client connection management
- Graceful cleanup on server shutdown
- Department-based filtering (optional)
- Initial state sent on connection

### 🔧 Configuration
All SSE logic follows existing code patterns:
- Uses existing service structure
- Follows error handling patterns
- Integrates with existing attendance flow
- No breaking changes to existing APIs

### 📊 Monitoring
```typescript
// Get current connected clients count
SSEService.getClientCount()
```

## Testing

### Using curl
```bash
# Connect to live stream
curl -N http://localhost:4000/api/attendance/live-stream

# With department filter
curl -N http://localhost:4000/api/attendance/live-stream?department=IT
```

### Using Browser
Open browser console and paste:
```javascript
const es = new EventSource('http://localhost:4000/api/attendance/live-stream');
es.onmessage = (e) => console.log(e);
es.addEventListener('check-in', (e) => console.log('CHECK IN:', JSON.parse(e.data)));
es.addEventListener('check-out', (e) => console.log('CHECK OUT:', JSON.parse(e.data)));
```

## Performance Considerations

1. **Connection Limits**: Monitor number of concurrent SSE connections
2. **Heartbeat Interval**: Default 30s (configurable in SSEService)
3. **Memory**: Each connection holds Response object in memory
4. **Network**: SSE uses HTTP/1.1 keep-alive (1 connection per client)

## Troubleshooting

### Connection Drops
- SSE auto-reconnects in browsers (built-in retry mechanism)
- Implement custom reconnection logic for production
- Check nginx/proxy timeout settings

### Events Not Received
- Verify SSE endpoint is accessible
- Check CORS settings in app.ts
- Ensure firewall allows long-lived connections
- Check browser console for errors

### High Memory Usage
- Limit concurrent connections (implement max clients)
- Add connection timeout for inactive clients
- Monitor with `SSEService.getClientCount()`

## Security Notes

- Add authentication middleware to `/api/attendance/live-stream` route
- Implement rate limiting for SSE connections
- Validate department filter input
- Use HTTPS in production for secure SSE connections

## Next Steps

1. Add authentication to SSE endpoint
2. Implement reconnection strategy in frontend
3. Add monitoring/metrics for SSE connections
4. Consider adding room-based filtering for large organizations
5. Implement connection limits per user/IP

---

## Complete Frontend Implementation Example

### Full React Component with Table Display

```tsx
import { useEffect, useState } from 'react';

interface AttendanceRecord {
  empId: string;
  name: string;
  department?: string;
  position?: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number;
  status: string;
  salaryStatus: string;
  deductionAmount: number;
  salaryForDay: number;
}

interface Summary {
  totalStaff: number;
  checkedIn: number;
  checkedOut: number;
  notMarked: number;
  onLeave: number;
  present: number;
  attendancePercent: number;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

function LiveAttendanceTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [lastActivity, setLastActivity] = useState<string>('');

  useEffect(() => {
    const API_URL = 'http://localhost:4000/api/attendance';
    const eventSource = new EventSource(`${API_URL}/live-stream?page=1&limit=50`);

    eventSource.addEventListener('connected', (event) => {
      const data = JSON.parse(event.data);
      console.log('Connected to live stream:', data.clientId);
      setIsLive(true);
    });

    // Receive initial data with full table
    eventSource.addEventListener('initial-summary', (event) => {
      const data = JSON.parse(event.data);
      setRecords(data.records);
      setSummary(data.summary);
      setPagination(data.pagination);
    });

    // Update table when someone checks in
    eventSource.addEventListener('check-in', (event) => {
      const checkInData = JSON.parse(event.data);
      setLastActivity(`${checkInData.name} checked in at ${checkInData.checkInTime}`);
      
      // Update the specific record in the table
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.empId === checkInData.empId 
            ? { ...record, checkIn: checkInData.checkInTime, status: 'Checked In' }
            : record
        )
      );
    });

    // Update table when someone checks out
    eventSource.addEventListener('check-out', (event) => {
      const checkOutData = JSON.parse(event.data);
      setLastActivity(`${checkOutData.name} checked out at ${checkOutData.checkOutTime}`);
      
      // Update the specific record in the table
      setRecords(prevRecords => 
        prevRecords.map(record => 
          record.empId === checkOutData.empId 
            ? { 
                ...record, 
                checkOut: checkOutData.checkOutTime, 
                hoursWorked: checkOutData.hoursWorked,
                status: 'Checked Out' 
              }
            : record
        )
      );
    });

    // Update summary cards
    eventSource.addEventListener('summary-update', (event) => {
      const data = JSON.parse(event.data);
      setSummary(data.summary);
      
      // Update the specific employee record in table if provided
      if (data.updatedRecord) {
        setRecords(prevRecords => 
          prevRecords.map(record => 
            record.empId === data.updatedRecord.empId 
              ? data.updatedRecord
              : record
          )
        );
      }
    });

    eventSource.onerror = () => {
      console.error('SSE connection error');
      setIsLive(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsLive(false);
    };
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
      case 'late':
      case 'checked in':
        return 'badge-success';
      case 'checked out':
        return 'badge-info';
      case 'absent':
      case 'not marked':
        return 'badge-danger';
      case 'on leave':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
      case 'late':
        return '✓ Checked In';
      case 'checked in':
        return '✓ Checked In';
      case 'checked out':
        return '⊙ Checked Out';
      case 'absent':
        return '⊘ Not Marked';
      case 'not marked':
        return '⊘ Not Marked';
      case 'on leave':
        return '📅 On Leave';
      default:
        return status;
    }
  };

  const formatTime = (time: string) => {
    return time || '-';
  };

  const formatHours = (hours: number) => {
    return hours > 0 ? hours.toFixed(2) : '-';
  };

  return (
    <div className="live-attendance-container">
      {/* Header with Live Status */}
      <div className="header">
        <h1>
          LIVE ATTENDANCE STATUS - {new Date().toLocaleDateString('en-GB')}
          {isLive && <span className="live-badge">● LIVE</span>}
        </h1>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="card">
            <div className="card-title">Total Staff</div>
            <div className="card-value">{summary.totalStaff}</div>
          </div>
          <div className="card">
            <div className="card-title">Checked In</div>
            <div className="card-value text-success">{summary.checkedIn}</div>
          </div>
          <div className="card">
            <div className="card-title">Checked Out</div>
            <div className="card-value text-info">{summary.checkedOut}</div>
          </div>
          <div className="card">
            <div className="card-title">Not Marked</div>
            <div className="card-value text-danger">{summary.notMarked}</div>
          </div>
          <div className="card">
            <div className="card-title">On Leave</div>
            <div className="card-value text-warning">{summary.onLeave}</div>
          </div>
          <div className="card">
            <div className="card-title">Attendance %</div>
            <div className="card-value">{summary.attendancePercent}%</div>
          </div>
        </div>
      )}

      {/* Last Activity */}
      {lastActivity && (
        <div className="activity-banner">
          <span className="activity-icon">🔔</span> {lastActivity}
        </div>
      )}

      {/* Attendance Table */}
      <div className="table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>EMP ID</th>
              <th>NAME</th>
              <th>DEPARTMENT</th>
              <th>POSITION</th>
              <th>STATUS</th>
              <th>CHECK IN</th>
              <th>CHECK OUT</th>
              <th>HOURS</th>
              <th>LOCATION</th>
              <th>LAST ACTIVITY</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.empId}>
                <td>{record.empId}</td>
                <td>{record.name}</td>
                <td>{record.department || '-'}</td>
                <td>{record.position || '-'}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                    {formatStatus(record.status)}
                  </span>
                </td>
                <td className="time">{formatTime(record.checkIn)}</td>
                <td className="time">{formatTime(record.checkOut)}</td>
                <td className="hours">{formatHours(record.hoursWorked)}</td>
                <td>Main Office</td>
                <td className="text-muted">
                  {record.checkOut ? 'Checked out' : record.checkIn ? 'Checked in' : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="pagination-info">
          Showing {records.length} of {pagination.totalCount} employees
        </div>
      )}
    </div>
  );
}

export default LiveAttendanceTable;
```

### CSS Styles

```css
.live-attendance-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 15px 20px;
  margin: -20px -20px 20px -20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.live-badge {
  background: #27ae60;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.card-title {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
}

.text-success { color: #27ae60; }
.text-info { color: #3498db; }
.text-danger { color: #e74c3c; }
.text-warning { color: #f39c12; }

.activity-banner {
  background: #3498db;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.attendance-table {
  width: 100%;
  border-collapse: collapse;
}

.attendance-table thead {
  background: #34495e;
  color: white;
}

.attendance-table th {
  padding: 15px 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.attendance-table tbody tr {
  border-bottom: 1px solid #ecf0f1;
  transition: background 0.2s;
}

.attendance-table tbody tr:hover {
  background: #f8f9fa;
}

.attendance-table td {
  padding: 15px 12px;
  font-size: 13px;
  color: #2c3e50;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

.badge-danger {
  background: #f8d7da;
  color: #721c24;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.time {
  font-family: 'Courier New', monospace;
  font-weight: 600;
}

.hours {
  font-weight: 600;
  color: #27ae60;
}

.text-muted {
  color: #95a5a6;
  font-size: 12px;
}

.pagination-info {
  text-align: center;
  padding: 15px;
  color: #7f8c8d;
  font-size: 13px;
}
```

### HTML (for vanilla JS)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Attendance</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="live-attendance-container">
    <div class="header">
      <h1>
        LIVE ATTENDANCE STATUS - <span id="date"></span>
        <span class="live-badge">● LIVE</span>
      </h1>
    </div>

    <div class="summary-cards" id="summaryCards"></div>
    <div id="activityBanner"></div>

    <div class="table-container">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>EMP ID</th>
            <th>NAME</th>
            <th>DEPARTMENT</th>
            <th>POSITION</th>
            <th>STATUS</th>
            <th>CHECK IN</th>
            <th>CHECK OUT</th>
            <th>HOURS</th>
            <th>LOCATION</th>
            <th>LAST ACTIVITY</th>
          </tr>
        </thead>
        <tbody id="tableBody"></tbody>
      </table>
    </div>

    <div class="pagination-info" id="paginationInfo"></div>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

### JavaScript (app.js)

```javascript
let recordsMap = new Map();

// Set current date
document.getElementById('date').textContent = new Date().toLocaleDateString('en-GB');

// Connect to SSE
const eventSource = new EventSource('http://localhost:4000/api/attendance/live-stream?page=1&limit=100');

eventSource.addEventListener('connected', (event) => {
  console.log('Connected to live stream');
});

eventSource.addEventListener('initial-summary', (event) => {
  const data = JSON.parse(event.data);
  updateSummary(data.summary);
  updateTable(data.records);
  updatePagination(data.pagination);
});

eventSource.addEventListener('check-in', (event) => {
  const data = JSON.parse(event.data);
  showActivity(`${data.name} checked in at ${data.checkInTime}`);
  updateRecordStatus(data.empId, { checkIn: data.checkInTime, status: 'Checked In' });
});

eventSource.addEventListener('check-out', (event) => {
  const data = JSON.parse(event.data);
  showActivity(`${data.name} checked out at ${data.checkOutTime}`);
  updateRecordStatus(data.empId, { 
    checkOut: data.checkOutTime, 
    hoursWorked: data.hoursWorked,
    status: 'Checked Out' 
  });
});

eventSource.addEventListener('summary-update', (event) => {
  const data = JSON.parse(event.data);
  updateSummary(data.summary);
  
  // Update the specific employee record in table if provided
  if (data.updatedRecord) {
    const record = recordsMap.get(data.updatedRecord.empId);
    if (record) {
      Object.assign(record, data.updatedRecord);
      renderTable();
    }
  }
});

function updateSummary(summary) {
  document.getElementById('summaryCards').innerHTML = `
    <div class="card">
      <div class="card-title">Total Staff</div>
      <div class="card-value">${summary.totalStaff}</div>
    </div>
    <div class="card">
      <div class="card-title">Checked In</div>
      <div class="card-value text-success">${summary.checkedIn}</div>
    </div>
    <div class="card">
      <div class="card-title">Checked Out</div>
      <div class="card-value text-info">${summary.checkedOut}</div>
    </div>
    <div class="card">
      <div class="card-title">Not Marked</div>
      <div class="card-value text-danger">${summary.notMarked}</div>
    </div>
    <div class="card">
      <div class="card-title">On Leave</div>
      <div class="card-value text-warning">${summary.onLeave}</div>
    </div>
    <div class="card">
      <div class="card-title">Attendance %</div>
      <div class="card-value">${summary.attendancePercent}%</div>
    </div>
  `;
}

function updateTable(records) {
  recordsMap.clear();
  records.forEach(record => recordsMap.set(record.empId, record));
  renderTable();
}

function updateRecordStatus(empId, updates) {
  const record = recordsMap.get(empId);
  if (record) {
    Object.assign(record, updates);
    renderTable();
  }
}

function renderTable() {
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = Array.from(recordsMap.values()).map(record => `
    <tr>
      <td>${record.empId}</td>
      <td>${record.name}</td>
      <td>${record.department || '-'}</td>
      <td>${record.position || '-'}</td>
      <td>${getStatusBadge(record.status)}</td>
      <td class="time">${record.checkIn || '-'}</td>
      <td class="time">${record.checkOut || '-'}</td>
      <td class="hours">${record.hoursWorked > 0 ? record.hoursWorked.toFixed(2) : '-'}</td>
      <td>Main Office</td>
      <td class="text-muted">${getLastActivity(record)}</td>
    </tr>
  `).join('');
}

function getStatusBadge(status) {
  const badges = {
    'Present': '<span class="status-badge badge-success">✓ Checked In</span>',
    'Late': '<span class="status-badge badge-success">✓ Checked In</span>',
    'Checked In': '<span class="status-badge badge-success">✓ Checked In</span>',
    'Checked Out': '<span class="status-badge badge-info">⊙ Checked Out</span>',
    'Absent': '<span class="status-badge badge-danger">⊘ Not Marked</span>',
    'Not Marked': '<span class="status-badge badge-danger">⊘ Not Marked</span>',
    'On Leave': '<span class="status-badge badge-warning">📅 On Leave</span>',
  };
  return badges[status] || `<span class="status-badge badge-secondary">${status}</span>`;
}

function getLastActivity(record) {
  if (record.checkOut) return 'Checked out';
  if (record.checkIn) return 'Checked in';
  return '-';
}

function showActivity(message) {
  const banner = document.getElementById('activityBanner');
  banner.innerHTML = `<div class="activity-banner"><span class="activity-icon">🔔</span> ${message}</div>`;
  setTimeout(() => { banner.innerHTML = ''; }, 5000);
}

function updatePagination(pagination) {
  document.getElementById('paginationInfo').textContent = 
    `Showing ${recordsMap.size} of ${pagination.totalCount} employees`;
}
```

This complete implementation will display your live attendance data exactly like the screenshot you shared, with real-time updates via SSE!
