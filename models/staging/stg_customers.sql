WITH source AS (
    SELECT 
        C_CUSTKEY as customer_id,
        C_NAME as customer_name,
        C_ADDRESS as address,
        C_PHONE as phone,
        C_ACCTBAL as account_balance,
        C_MKTSEGMENT as market_segment,
        C_NATIONKEY as nation_id,
        C_COMMENT as comment,
        -- Extract email domain for marketing segmentation
        SPLIT_PART(C_COMMENT, '@', 2) as email_domain,
        -- Derive customer tier based on account balance
        CASE 
            WHEN C_ACCTBAL > 9000 THEN 'Premium'
            WHEN C_ACCTBAL > 5000 THEN 'Gold'
            WHEN C_ACCTBAL > 1000 THEN 'Silver'
            ELSE 'Bronze'
        END as customer_tier,
        -- Marketing segment details
        CASE C_MKTSEGMENT
            WHEN 'BUILDING' THEN 'Construction & Real Estate'
            WHEN 'AUTOMOBILE' THEN 'Automotive Industry'
            WHEN 'MACHINERY' THEN 'Industrial Equipment'
            WHEN 'HOUSEHOLD' THEN 'Consumer Goods'
            WHEN 'FURNITURE' THEN 'Home & Office'
            ELSE C_MKTSEGMENT
        END as market_segment_detail
    FROM 
        {{ source('tpch', 'customer') }}
)

SELECT *
FROM source
