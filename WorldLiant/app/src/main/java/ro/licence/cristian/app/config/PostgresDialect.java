package ro.licence.cristian.app.config;

import org.hibernate.dialect.PostgreSQL94Dialect;
import org.hibernate.dialect.function.SQLFunctionTemplate;
import org.hibernate.type.StandardBasicTypes;

public class PostgresDialect extends PostgreSQL94Dialect{

    public PostgresDialect() {
        super();
        registerFunction("string_agg", new SQLFunctionTemplate( StandardBasicTypes.STRING, "string_agg(?1, ?2)"));
    }
}
