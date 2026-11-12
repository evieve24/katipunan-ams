# Katipunan AMS — Updated Data Flow Diagram

This is the implemented DFD: the original core stores **D1–D11** plus the
final-system additions **D12 Scan & Location**, **D13 Notifications**, and
**D14 Sync**. The numbered processes follow the original diagram; Processes
4.1, 12.0, 13.0, and 14.0 are the implemented extensions.

`app_state` is not a DFD data store. It is the backend’s JSON snapshot that
projects into D2–D10; the logical DFD contains only D1–D14.

## Core DFD (original D1–D11)

```mermaid
flowchart LR
  OIC([GSO-OIC])
  INS([Inspectorate Personnel])
  GSO([GSO Office Personnel])
  HEAD([Municipal Office Head])

  subgraph P[Processes]
    P1["1.0 Manage User"]
    P2["2.0 Manage Asset"]
    P3["3.0 Manage Borrow"]
    P4["4.0 Manage Inventory"]
    P5["5.0 Asset Transfer"]
    P6["6.0 Asset Life Cycle"]
    P7["7.0 Procurement Forecasting"]
    P8["8.0 Maintenance"]
    P9["9.0 Generate Report"]
    P10["10.0 Activity Logs"]
    P11["11.0 Backup"]
  end

  subgraph D[Data Stores]
    D1[(D1 User Data)]
    D2[(D2 Asset Data)]
    D3[(D3 Borrow Data)]
    D4[(D4 Inventory Data)]
    D5[(D5 Asset Transfer Data)]
    D6[(D6 Asset Life Cycle Data)]
    D7[(D7 Forecasting Data)]
    D8[(D8 Maintenance Data)]
    D9[(D9 Report Data)]
    D10[(D10 Activity Logs Data)]
    D11[(D11 Backup Data)]
  end

  OIC --> P1
  OIC --> P2
  OIC --> P3
  OIC --> P5
  OIC --> P11

  INS --> P2
  INS --> P4
  INS --> P10

  GSO --> P2
  GSO --> P3
  GSO --> P4
  GSO --> P8

  HEAD --> P9
  HEAD --> P10

  P1 --> D1
  P2 --> D2
  P3 --> D3
  P4 --> D4
  P5 --> D5
  P6 --> D6
  P7 --> D7
  P8 --> D8
  P9 --> D9
  P10 --> D10
  P11 --> D11
```

## Final-system extensions

```mermaid
flowchart LR
  OIC([GSO-OIC])
  INS([Inspectorate Personnel])
  GSO([GSO Office Personnel])
  DEV([Browser / Device])
  GD([Google Drive])

  subgraph P[Extended Processes]
    P1["1.0 Manage User"]
    P41["4.1 Scan QR and Capture Location"]
    P11["11.0 Backup"]
    P12["12.0 Notify GSO-OIC"]
    P13["13.0 Sign-up and Approval"]
    P14["14.0 Offline Sync"]
  end

  subgraph D[Referenced Stores]
    D1[(D1 User Data)]
    D2[(D2 Asset Data)]
    D4[(D4 Inventory Data)]
    D10[(D10 Activity Logs Data)]
    D11[(D11 Backup Data)]
    D12[(D12 Scan and Location Data)]
    D13[(D13 Notification Data)]
    D14[(D14 Sync Data)]
  end

  OIC --> P12
  P12 --> D13
  D13 --> OIC

  INS --> P41
  GSO --> P41
  P41 --> D2
  P41 --> D4
  P41 --> D12

  DEV --> P14
  P14 --> D12
  P14 --> D14

  P13 --> D1
  P13 --> P1

  OIC --> P11
  P11 --> D11
  P11 --> GD
```

## Data-store map

| DFD store | Physical table(s) | View |
| --- | --- | --- |
| D1 User Data | `users`, `sessions` | `D1 User Data` |
| D2 Asset Data | `assets` | `D2 Asset Data` |
| D3 Borrow Data | `borrow` | `D3 Borrow Data` |
| D4 Inventory Data | `inventory` | `D4 Inventory Data` |
| D5 Asset Transfer Data | `asset_transfer` | `D5 Asset Transfer Data` |
| D6 Asset Life Cycle Data | `asset_lifecycle` | `D6 Asset Life Cycle Data` |
| D7 Forecasting Data | `procurement_forecast` | `D7 Forecasting Data` |
| D8 Maintenance Data | `maintenance_asset_report` | `D8 Maintenance Data` |
| D9 Report Data | `report` | `D9 Report Data` |
| D10 Activity Logs Data | `activity_log`, `audit` | `D10 Activity Logs Data` |
| D11 Backup Data | `backup` | `D11 Backup Data` |
| D12 Scan and Location Data | `asset_scan` | `D12 Scan and Location Data` |
| D13 Notification Data | `notifications` | `D13 Notification Data` |
| D14 Sync Data | `sync_events` | `D14 Sync Data` |

The detailed process/table mapping and implementation notes are in
[`DFD_MAPPING.md`](DFD_MAPPING.md).

The DFD-named views are inside `katipunan_ams` under **Views**, not separate
databases. On Windows/MariaDB they display lowercase in phpMyAdmin because of
`lower_case_table_names=1`; query them with backticks if needed.
