WITH source AS (
    SELECT 
        O_ORDERKEY as order_id,
        O_CUSTKEY as customer_id,
        O_ORDERSTATUS as order_status,
        O_TOTALPRICE as total_price,
        O_ORDERDATE as order_date,
        O_ORDERPRIORITY as order_priority,
        O_CLERK as sales_rep,
        O_SHIPPRIORITY as ship_priority,
        O_COMMENT as comment,
        -- Derive order season for seasonal analysis
        CASE 
            WHEN MONTH(O_ORDERDATE) IN (12,1,2) THEN 'Winter'
            WHEN MONTH(O_ORDERDATE) IN (3,4,5) THEN 'Spring'
            WHEN MONTH(O_ORDERDATE) IN (6,7,8) THEN 'Summer'
            ELSE 'Fall'
        END as order_season,
        -- Sales rep region (derived from clerk ID)
        SUBSTRING(O_CLERK, 1, 3) as sales_rep_region,
        -- Order size category
        CASE 
            WHEN O_TOTALPRICE > 300000 THEN 'Large'
            WHEN O_TOTALPRICE > 150000 THEN 'Medium'
            ELSE 'Small'
        END as order_size_category
    FROM 
        {{ source('tpch', 'orders') }}
)

SELECT *
FROM source
