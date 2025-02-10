{% macro init_database() %}
    {% set sql %}
        CREATE DATABASE IF NOT EXISTS CUSTOMER_360_DB;
        USE DATABASE CUSTOMER_360_DB;
        CREATE SCHEMA IF NOT EXISTS DBT_TRANSFORMS;
    {% endset %}
    {% do run_query(sql) %}
{% endmacro %}
