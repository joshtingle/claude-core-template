# Database: SQL Server (AWS RDS)

For RDS for SQL Server (most common) and RDS Custom for SQL Server (when you need more OS-level control).

## Connection

SQL authentication via the master user, or Windows authentication via AWS Directory Service.  For most personal projects, SQL auth is the practical choice.

Required env vars:

- `RDS_HOST` (e.g. `mydb.abc123.us-east-1.rds.amazonaws.com`)
- `RDS_PORT` (default 1433)
- `RDS_DATABASE`
- `RDS_USERNAME`
- `RDS_PASSWORD`

## SDKs

Same as Azure SQL: `mssql` for Node, `Microsoft.Data.SqlClient` for .NET, `pyodbc` for Python.

## Network access

RDS instances live in a VPC.  For dev access from a personal machine:

- DB security group must allow inbound TCP on the SQL Server port (1433) from the dev machine's IP, or from `0.0.0.0/0` for development convenience (not recommended).
- DB instance must have `PubliclyAccessible = true` if connecting from outside the VPC.

For app access from an EC2 instance in the same VPC, the security group rule allows the EC2 instance's security group as the source.  This is the preferred pattern for production: keep the DB private, route through the app.

When introducing a new connection source, remind the user to update security group rules.

## RDS-specific behaviors

Maintenance windows can cause brief connection drops.  Build retry logic with exponential backoff into the data layer, especially for jobs that run unattended.

Multi-AZ failover causes a connection reset.  DNS endpoint stays the same but in-flight transactions die.  Same retry guidance.

Automated backups are on by default with 7-day retention.  Not a substitute for migration discipline.  Don't rely on snapshots for "undo" of bad schema changes.

Performance Insights and Enhanced Monitoring are off by default.  Enable for any RDS instance hosting a real workload.  The cost is minimal.

## RDS-specific stored procedures

When using SQL Server Agent jobs on RDS, Agent is supported but some msdb operations are restricted.  Stored procedures for job creation must use the RDS-provided helpers (`msdb.dbo.rds_*`).

## Tunneling for local debugging

Don't open the RDS instance to the internet just for debugging.  Use an SSH tunnel through EC2:

```bash
ssh -L 1433:rds-private-dns:1433 ubuntu@ec2-ip
# now connect to localhost:1433 from your dev machine
```

Or add your dev IP to the security group temporarily and remove when done.

## SQL style and "things to never do"

Identical to the Azure SQL module.  See `sqlserver-azure.md`.
