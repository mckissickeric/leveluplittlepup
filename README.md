# Customer 360 DBT Project

This DBT project creates a comprehensive Customer 360 view using Snowflake sample data.

## Project Structure

```
customer_360_dbt/
├── models/
│   ├── staging/           # Raw data staging
│   │   ├── stg_customers.sql
│   │   └── stg_orders.sql
│   ├── intermediate/      # Reusable transformed data
│   │   └── int_customer_value_metrics.sql
│   └── marts/            # Business-level presentation
│       └── customer_360.sql
├── macros/              # Reusable SQL snippets
├── tests/              # Custom data tests
├── dbt_project.yml     # Project configuration
├── profiles.yml        # Connection configuration
└── packages.yml        # External dependencies
```

## Environment Setup

1. Install dependencies:
   ```bash
   pip install dbt-snowflake
   dbt deps
   ```

2. Configure your profile:
   ```yaml
   # profiles.yml
   customer_360:
     target: dev  # Default target
     outputs:
       dev:
         type: snowflake
         account: your-account
         ...
   ```

## Running the Project

### Development
```bash
dbt run --target dev
dbt test
```

### Production
```bash
dbt run --target prod
dbt test
```

## Scheduling

Models are tagged for different scheduling frequencies:
- Daily: `tag:daily`
- Monthly: `tag:monthly`

Run specific schedules:
```bash
python schedule.py
```

## Documentation

Generate and view documentation:
```bash
dbt docs generate
dbt docs serve
```

## Testing

Run all tests:
```bash
dbt test
```

Run specific tests:
```bash
dbt test --models customer_360
```

## Environments

- **Dev**: Development and testing
- **Staging**: Pre-production validation
- **Prod**: Production environment

Switch environments:
```bash
dbt run --target prod
```

## Contributing

1. Create a new branch
2. Make changes
3. Run tests
4. Submit PR

## License

MIT
