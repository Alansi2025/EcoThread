package com.ecothread;

import com.ecothread.model.*;
import com.ecothread.repository.*;
import com.ecothread.service.InventoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:derby://127.0.0.1:5566/ecothreaddb;create=true",
        "spring.datasource.driver-class-name=org.apache.derby.client.ClientAutoloadedDriver",
        "spring.datasource.username=app",
        "spring.datasource.password=app",
        "spring.jpa.database-platform=org.hibernate.dialect.DerbyDialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "server.port=5577"
})
public class ApacheSqlDatabaseTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryItemRepository inventoryItemRepository;

    @Autowired
    private PickupRequestRepository pickupRequestRepository;

    @Autowired
    private InventoryService inventoryService;

    @Test
    @DisplayName("Apache SQL: Test Direct JDBC Connection and Raw SQL on Port 5566")
    void testDirectApacheSqlJdbc() throws Exception {
        String jdbcUrl = "jdbc:derby://127.0.0.1:5566/ecothreaddb;create=true";
        try (Connection conn = DriverManager.getConnection(jdbcUrl, "app", "app")) {
            assertNotNull(conn, "Database connection should not be null");
            assertFalse(conn.isClosed(), "Database connection should be open");

            DatabaseMetaData metaData = conn.getMetaData();
            System.out.println("✅ Apache SQL Database: " + metaData.getDatabaseProductName() + " " + metaData.getDatabaseProductVersion());
            assertTrue(metaData.getDatabaseProductName().toLowerCase().contains("derby"), "Database should be Apache Derby");

            try (Statement stmt = conn.createStatement()) {
                // Drop if exists from previous runs
                try {
                    stmt.execute("DROP TABLE apache_sql_benchmark");
                } catch (SQLException ignored) {
                }

                // DDL Create Table
                stmt.execute("CREATE TABLE apache_sql_benchmark (" +
                        "id INT PRIMARY KEY, " +
                        "entity_name VARCHAR(100), " +
                        "eco_points INT, " +
                        "recorded_at TIMESTAMP)");

                // DML Parameterized Insert
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "INSERT INTO apache_sql_benchmark (id, entity_name, eco_points, recorded_at) VALUES (?, ?, ?, ?)")) {
                    pstmt.setInt(1, 101);
                    pstmt.setString(2, "Organic Cotton Cargo Pants");
                    pstmt.setInt(3, 25);
                    pstmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
                    int inserted = pstmt.executeUpdate();
                    assertEquals(1, inserted);
                }

                // Query Select
                try (ResultSet rs = stmt.executeQuery("SELECT entity_name, eco_points FROM apache_sql_benchmark WHERE id = 101")) {
                    assertTrue(rs.next(), "Should retrieve inserted record");
                    assertEquals("Organic Cotton Cargo Pants", rs.getString("entity_name"));
                    assertEquals(25, rs.getInt("eco_points"));
                }

                // Update
                int updated = stmt.executeUpdate("UPDATE apache_sql_benchmark SET eco_points = 50 WHERE id = 101");
                assertEquals(1, updated);

                // Delete
                int deleted = stmt.executeUpdate("DELETE FROM apache_sql_benchmark WHERE id = 101");
                assertEquals(1, deleted);

                // Clean up table
                stmt.execute("DROP TABLE apache_sql_benchmark");
            }
        }
    }

    @Test
    @DisplayName("Apache SQL: Test ACID Transaction Rollback and Commit Semantics on Port 5566")
    void testApacheSqlTransactionSemantics() throws Exception {
        String jdbcUrl = "jdbc:derby://127.0.0.1:5566/ecothreaddb;create=true";
        try (Connection conn = DriverManager.getConnection(jdbcUrl, "app", "app")) {
            conn.setAutoCommit(false);

            try (Statement stmt = conn.createStatement()) {
                try {
                    stmt.execute("DROP TABLE apache_txn_test");
                } catch (SQLException ignored) {}

                stmt.execute("CREATE TABLE apache_txn_test (id INT PRIMARY KEY, status VARCHAR(50))");
                conn.commit();

                // Insert uncommitted row
                stmt.executeUpdate("INSERT INTO apache_txn_test VALUES (1, 'UNCOMMITTED')");
                
                // Rollback
                conn.rollback();

                try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM apache_txn_test")) {
                    assertTrue(rs.next());
                    assertEquals(0, rs.getInt(1), "Row should have been rolled back");
                }

                // Insert and commit
                stmt.executeUpdate("INSERT INTO apache_txn_test VALUES (2, 'COMMITTED')");
                conn.commit();

                try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM apache_txn_test")) {
                    assertTrue(rs.next());
                    assertEquals(1, rs.getInt(1), "Row should have been committed");
                }

                stmt.execute("DROP TABLE apache_txn_test");
                conn.commit();
            }
        }
    }

    @Test
    @DisplayName("Apache SQL: Test Spring Data JPA Repository Persistence & Query on Port 5566")
    void testSpringJpaEntitiesOnApacheSql() {
        // Test User Persistence
        String testEmail = "derby_donor_" + System.currentTimeMillis() + "@ecothread.org";
        User user = new User("Derby Test Donor", testEmail, "hash123", "+91 99999 88888", Role.ROLE_DONOR, 0);
        User savedUser = userRepository.save(user);

        assertNotNull(savedUser.getId(), "User ID should be generated by Apache SQL database");
        assertTrue(userRepository.existsByEmail(testEmail));

        // Test Inventory Persistence
        InventoryItem item = new InventoryItem(
                "Apache SQL Upcycled Jacket",
                "Insulated upcycled jacket tested with Apache SQL persistence",
                "Outerwear",
                "Unisex",
                "L",
                "Winter",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1539533018447-63fcce667823",
                20
        );
        item.setQcNotes("Passed Derby persistence verification");
        InventoryItem savedItem = inventoryItemRepository.save(item);
        assertNotNull(savedItem.getId());
        assertEquals("Apache SQL Upcycled Jacket", savedItem.getTitle());
        assertEquals(ConditionGrade.GRADE_A, savedItem.getConditionGrade());

        // Query by Grade
        long gradeACount = inventoryItemRepository.countByConditionGrade(ConditionGrade.GRADE_A);
        assertTrue(gradeACount >= 1, "Should count items in Apache SQL database");
    }

    @Test
    @DisplayName("Apache SQL: Test Dynamic Specification Catalog Filtering on Port 5566")
    void testCatalogDynamicFilteringOnApacheSql() {
        InventoryItem item = new InventoryItem(
                "Warm Knitted Wool Sweater",
                "Handcrafted from reclaimed merino wool yarns",
                "Knitwear",
                "Women",
                "M",
                "Winter",
                ConditionGrade.GRADE_A,
                "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9",
                15
        );
        inventoryItemRepository.save(item);

        // Filter with all nulls
        List<InventoryItem> allGradeA = inventoryService.getCatalogItems(null, null, null, null, null);
        assertFalse(allGradeA.isEmpty(), "Should retrieve items with null filters on Apache SQL");

        // Filter with category and gender
        List<InventoryItem> filtered = inventoryService.getCatalogItems("women", "knitwear", "M", "winter", "Sweater");
        assertFalse(filtered.isEmpty(), "Should find item matching all attributes");
        assertEquals("Warm Knitted Wool Sweater", filtered.get(0).getTitle());

        // Filter with search query
        List<InventoryItem> searched = inventoryService.getCatalogItems(null, null, null, null, "merino");
        assertFalse(searched.isEmpty(), "Should find item by text description search");
    }
}
