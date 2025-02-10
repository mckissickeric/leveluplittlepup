-- Reusable model for customer value calculations
WITH customer_orders AS (
    SELECT * FROM {{ ref('stg_orders') }}
),

customer_base AS (
    SELECT * FROM {{ ref('stg_customers') }}
),

value_metrics AS (
    SELECT
        c.customer_id,
        -- Recency score (40% of total)
        CASE 
            WHEN DATEDIFF(day, MAX(o.order_date), CURRENT_DATE()) <= 30 THEN 40
            WHEN DATEDIFF(day, MAX(o.order_date), CURRENT_DATE()) <= 90 THEN 30
            WHEN DATEDIFF(day, MAX(o.order_date), CURRENT_DATE()) <= 180 THEN 20
            ELSE 10
        END as recency_score,
        
        -- Frequency score (30% of total)
        CASE 
            WHEN COUNT(o.order_id) >= 10 THEN 30
            WHEN COUNT(o.order_id) >= 5 THEN 20
            WHEN COUNT(o.order_id) >= 2 THEN 10
            ELSE 5
        END as frequency_score,
        
        -- Monetary score (30% of total)
        CASE 
            WHEN SUM(o.total_price) >= 500000 THEN 30
            WHEN SUM(o.total_price) >= 250000 THEN 20
            WHEN SUM(o.total_price) >= 100000 THEN 10
            ELSE 5
        END as monetary_score,
        
        -- Additional metrics
        COUNT(o.order_id) as total_orders,
        SUM(o.total_price) as total_spent,
        AVG(o.total_price) as avg_order_value,
        MIN(o.order_date) as first_order_date,
        MAX(o.order_date) as last_order_date
    FROM customer_base c
    LEFT JOIN customer_orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id
)

SELECT 
    *,
    recency_score + frequency_score + monetary_score as rfm_score,
    CASE 
        WHEN (recency_score + frequency_score + monetary_score) >= 90 THEN 'Diamond'
        WHEN (recency_score + frequency_score + monetary_score) >= 70 THEN 'Platinum'
        WHEN (recency_score + frequency_score + monetary_score) >= 50 THEN 'Gold'
        ELSE 'Silver'
    END as customer_segment
FROM value_metrics
