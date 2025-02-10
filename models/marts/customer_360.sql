WITH customer_orders AS (
    SELECT
        customer_id,
        COUNT(*) as total_orders,
        SUM(total_price) as total_spent,
        MIN(order_date) as first_order_date,
        MAX(order_date) as last_order_date,
        -- Marketing analytics
        COUNT(DISTINCT sales_rep) as total_sales_reps,
        COUNT(DISTINCT sales_rep_region) as total_sales_regions,
        -- Seasonal preferences
        SUM(CASE WHEN order_season = 'Winter' THEN 1 ELSE 0 END) as winter_orders,
        SUM(CASE WHEN order_season = 'Spring' THEN 1 ELSE 0 END) as spring_orders,
        SUM(CASE WHEN order_season = 'Summer' THEN 1 ELSE 0 END) as summer_orders,
        SUM(CASE WHEN order_season = 'Fall' THEN 1 ELSE 0 END) as fall_orders,
        -- Order size analysis
        SUM(CASE WHEN order_size_category = 'Large' THEN 1 ELSE 0 END) as large_orders,
        SUM(CASE WHEN order_size_category = 'Medium' THEN 1 ELSE 0 END) as medium_orders,
        SUM(CASE WHEN order_size_category = 'Small' THEN 1 ELSE 0 END) as small_orders,
        -- Most common sales rep
        MODE(sales_rep) as primary_sales_rep,
        MODE(sales_rep_region) as primary_sales_region
    FROM {{ ref('stg_orders') }}
    GROUP BY customer_id
),

customer_order_patterns AS (
    SELECT
        customer_id,
        -- Preferred season (most orders)
        CASE GREATEST(winter_orders, spring_orders, summer_orders, fall_orders)
            WHEN winter_orders THEN 'Winter'
            WHEN spring_orders THEN 'Spring'
            WHEN summer_orders THEN 'Summer'
            ELSE 'Fall'
        END as preferred_season,
        -- Order size preference
        CASE GREATEST(large_orders, medium_orders, small_orders)
            WHEN large_orders THEN 'Large'
            WHEN medium_orders THEN 'Medium'
            ELSE 'Small'
        END as preferred_order_size
    FROM customer_orders
)

SELECT
    -- Customer Information
    c.customer_id,
    c.customer_name,
    c.address,
    c.phone,
    c.account_balance,
    c.market_segment,
    c.market_segment_detail,
    c.nation_id,
    c.email_domain,
    c.customer_tier,
    
    -- Order Statistics
    COALESCE(co.total_orders, 0) as total_orders,
    COALESCE(co.total_spent, 0) as total_spent,
    co.first_order_date,
    co.last_order_date,
    DATEDIFF(day, co.first_order_date, co.last_order_date) as customer_lifetime_days,
    
    -- Sales Team Interaction
    co.total_sales_reps,
    co.total_sales_regions,
    co.primary_sales_rep,
    co.primary_sales_region,
    
    -- Seasonal Analysis
    co.winter_orders,
    co.spring_orders,
    co.summer_orders,
    co.fall_orders,
    cop.preferred_season,
    
    -- Order Size Analysis
    co.large_orders,
    co.medium_orders,
    co.small_orders,
    cop.preferred_order_size,
    
    -- Marketing Metrics
    CASE 
        WHEN DATEDIFF(day, co.last_order_date, CURRENT_DATE()) > 365 THEN 'Inactive'
        WHEN DATEDIFF(day, co.last_order_date, CURRENT_DATE()) > 180 THEN 'At Risk'
        WHEN DATEDIFF(day, co.last_order_date, CURRENT_DATE()) > 90 THEN 'Cooling'
        ELSE 'Active'
    END as customer_status,
    
    -- Average order value
    CASE 
        WHEN COALESCE(co.total_orders, 0) = 0 THEN 0 
        ELSE COALESCE(co.total_spent, 0) / co.total_orders 
    END as avg_order_value,
    
    -- Customer value score (0-100)
    CASE 
        WHEN c.customer_tier = 'Premium' THEN 100
        WHEN c.customer_tier = 'Gold' THEN 75
        WHEN c.customer_tier = 'Silver' THEN 50
        ELSE 25
    END + 
    CASE 
        WHEN COALESCE(co.total_orders, 0) > 10 THEN 50
        WHEN COALESCE(co.total_orders, 0) > 5 THEN 25
        ELSE 0
    END as customer_value_score

FROM {{ ref('stg_customers') }} c
LEFT JOIN customer_orders co
    ON c.customer_id = co.customer_id
LEFT JOIN customer_order_patterns cop
    ON c.customer_id = cop.customer_id
