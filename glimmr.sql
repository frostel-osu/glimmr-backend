-- BEGIN BULK WRITE OPERATION

SET FOREIGN_KEY_CHECKS = 0;

SET AUTOCOMMIT = 0;

-- CREATE TABLE FOR USERS

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(255) NOT NULL UNIQUE
);

DROP TABLE IF EXISTS connections;

-- CREATE TABLE FOR CONNECTIONS

CREATE TABLE connections (
  id_connection INT AUTO_INCREMENT PRIMARY KEY,
  id_user_1 INT,
  id_user_2 INT,
  CONSTRAINT fk_connections_id_user_1
    FOREIGN KEY (id_user_1)
    REFERENCES users (id_user)
    ON DELETE SET NULL,
  CONSTRAINT fk_connections_id_user_2
    FOREIGN KEY (id_user_2)
    REFERENCES users (id_user)
    ON DELETE SET NULL,
  CONSTRAINT unique_connections_id_user_1_id_user_2
    UNIQUE (id_user_1, id_user_2)
);

-- VALIDATE CONNECTIONS

DELIMITER //

DROP PROCEDURE IF EXISTS validate_connections;

CREATE PROCEDURE validate_connections (IN id_user_1 INT, IN id_user_2 INT)
  BEGIN
    IF id_user_1 >= id_user_2 THEN
      SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "The smaller user ID must come first";
    END IF;
  END //

DROP TRIGGER IF EXISTS before_insert_connections;

CREATE TRIGGER before_insert_connections BEFORE INSERT ON connections
  FOR EACH ROW
  BEGIN
    CALL validate_connections (NEW.id_user_1, NEW.id_user_2);
  END //

DROP TRIGGER IF EXISTS before_update_connections;

CREATE TRIGGER before_update_connections BEFORE UPDATE ON connections
  FOR EACH ROW
  BEGIN
    CALL validate_connections (NEW.id_user_1, NEW.id_user_2);
  END //

DELIMITER ;

-- CREATE TABLE FOR LIKES

DROP TABLE IF EXISTS likes;

CREATE TABLE likes (
  id_like INT AUTO_INCREMENT PRIMARY KEY,
  id_connection INT NOT NULL,
  id_user INT,
  date datetime NOT NULL,
  CONSTRAINT fk_likes_id_connection
    FOREIGN KEY (id_connection)
    REFERENCES connections (id_connection)
    ON DELETE CASCADE,
  CONSTRAINT fk_likes_id_user
    FOREIGN KEY (id_user)
    REFERENCES users (id_user)
    ON DELETE SET NULL
);

-- CREATE TABLE FOR MESSAGES

DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id_message INT AUTO_INCREMENT PRIMARY KEY,
  id_connection INT NOT NULL,
  id_user INT,
  date datetime NOT NULL,
  text VARCHAR(255) NOT NULL,
  CONSTRAINT fk_messages_id_connection
    FOREIGN KEY (id_connection)
    REFERENCES connections (id_connection)
    ON DELETE CASCADE,
  CONSTRAINT fk_messages_id_user
    FOREIGN KEY (id_user)
    REFERENCES users (id_user)
    ON DELETE SET NULL
);

-- CREATE TABLE FOR BLOCKS

DROP TABLE IF EXISTS blocks;

CREATE TABLE blocks (
  id_block INT AUTO_INCREMENT PRIMARY KEY,
  id_connection INT NOT NULL,
  id_user INT,
  date datetime NOT NULL,
  CONSTRAINT fk_blocks_id_connection
    FOREIGN KEY (id_connection)
    REFERENCES connections (id_connection)
    ON DELETE CASCADE,
  CONSTRAINT fk_blocks_id_user
    FOREIGN KEY (id_user)
    REFERENCES users (id_user)
    ON DELETE SET NULL
);

-- CREATE TABLE FOR REPORTS

DROP TABLE IF EXISTS reports;

CREATE TABLE reports (
  id_report INT AUTO_INCREMENT PRIMARY KEY,
  id_connection INT NOT NULL,
  id_user INT,
  date datetime NOT NULL,
  text VARCHAR(255) NOT NULL,
  CONSTRAINT fk_reports_id_connection
    FOREIGN KEY (id_connection)
    REFERENCES connections (id_connection)
    ON DELETE CASCADE,
  CONSTRAINT fk_reports_id_user
    FOREIGN KEY (id_user)
    REFERENCES users (id_user)
    ON DELETE SET NULL
);

-- INSERT EXAMPLE USERS

INSERT INTO users (
  date,
  email,
  name,
  phone
) VALUES (
  "2525-01-02",
  "alex@example.com",
  "Alex",
  "555-111-1111"
), (
  "2525-01-11",
  "taylor@example.com",
  "Taylor",
  "555-222-2222"
), (
  "2525-01-16",
  "riley@example.com",
  "Riley",
  "555-333-3333"
);

-- CACHE id_user QUERIES

SET @alex = (SELECT id_user FROM users WHERE email = "alex@example.com");

SET @taylor = (SELECT id_user FROM users WHERE email = "taylor@example.com");

-- INSERT EXAMPLE CONNECTIONS

INSERT INTO connections (
  id_user_1,
  id_user_2
) VALUES (
  @alex,
  @taylor
), (
  @alex,
  NULL
), (
  NULL,
  NULL
);

-- CACHE id_connection QUERIES

SET @alex_taylor = (SELECT id_connection FROM connections WHERE id_user_1 = @alex AND id_user_2 = @taylor);

SET @alex_null = (SELECT id_connection FROM connections WHERE id_user_1 = @alex AND id_user_2 IS NULL LIMIT 1);

SET @null_null = (SELECT id_connection FROM connections WHERE id_user_1 IS NULL AND id_user_2 IS NULL LIMIT 1);

-- INSERT EXAMPLE LIKES

INSERT INTO likes (
  id_connection,
  id_user,
  date
) VALUES (
  @alex_null,
  @alex,
  "2525-01-03"
), (
  @alex_null,
  NULL,
  "2525-01-04"
), (
  @alex_taylor,
  @alex,
  "2525-01-12"
), (
  @alex_taylor,
  @taylor,
  "2525-01-13"
);

-- INSERT EXAMPLE MESSAGES

INSERT INTO messages (
  id_connection,
  id_user,
  date,
  text
) VALUES (
  @alex_null,
  NULL,
  "2525-01-05",
  "[REDACTED]"
), (
  @alex_null,
  @alex,
  "2525-01-07",
  "[REDACTED]"
), (
  @alex_taylor,
  @alex,
  "2525-01-14",
  "[REDACTED]"
);

-- INSERT EXAMPLE BLOCKS

INSERT INTO blocks (
  id_connection,
  id_user,
  date
) VALUES (
  @alex_null,
  @alex,
  "2525-01-08"
), (
  @alex_null,
  NULL,
  "2525-01-09"
), (
  @alex_taylor,
  @alex,
  "2525-01-15"
);

-- INSERT EXAMPLE REPORTS

INSERT INTO reports (
  id_connection,
  id_user,
  date,
  text
) VALUES (
  @null_null,
  NULL,
  "2525-01-01",
  "[REDACTED]"
), (
  @alex_null,
  @alex,
  "2525-01-06",
  "[REDACTED]"
), (
  @alex_null,
  @alex,
  "2525-01-10",
  "[REDACTED]"
);

-- END BULK WRITE OPERATION

SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
