{% macro create_warehouse(warehouse_name, warehouse_size='XSMALL') %}
    {% set sql %}
        CREATE WAREHOUSE IF NOT EXISTS {{ warehouse_name }}
        WITH WAREHOUSE_SIZE = '{{ warehouse_size }}'
        AUTO_SUSPEND = 300
        AUTO_RESUME = TRUE;
    {% endset %}
    {% do run_query(sql) %}
{% endmacro %}
