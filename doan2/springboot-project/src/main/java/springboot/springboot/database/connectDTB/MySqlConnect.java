package springboot.springboot.database.connectDTB;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MySqlConnect {

    public static Connection getMySQLConnection() throws SQLException {
        String hostName = "127.0.0.1"; // 127.0.1 hoặc localhost
        String dbName = "fpthealth";
        String userName = "root";
        String password = "";
        String connectionURL = "jdbc:mysql://" + hostName + ":3306/" + dbName;
        return DriverManager.getConnection(connectionURL, userName, password);
    }
}
