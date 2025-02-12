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

CREATE PROCEDURE validate_connections (IN p_id_user_1 INT, IN p_id_user_2 INT)
  BEGIN
    IF p_id_user_1 >= p_id_user_2 THEN
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
    ON DELETE SET NULL,
  CONSTRAINT unique_likes_id_connection_id_user
    UNIQUE (id_connection, id_user)
);

-- CREATE ASSERTIONS FOR VALIDATION

DELIMITER //

DROP FUNCTION IF EXISTS assert_connection_has_two_likes;

CREATE FUNCTION assert_connection_has_two_likes (p_id_connection INT, p_id_user INT)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    DECLARE v_likes_count INT;

    SELECT COUNT(*) INTO v_likes_count
      FROM likes
      WHERE id_connection = p_id_connection;

    RETURN v_likes_count = 2;
  END //

DROP FUNCTION IF EXISTS assert_connection_has_user;

CREATE FUNCTION assert_connection_has_user (p_id_connection INT, p_id_user INT)
  RETURNS BOOLEAN
  READS SQL DATA
  BEGIN
    DECLARE v_connections_count INT;

    SELECT COUNT(*) INTO v_connections_count
      FROM connections
      WHERE id_connection = p_id_connection
      AND (
        (id_user_1 IS NULL OR id_user_2 IS NULL) AND p_id_user IS NULL
        OR id_user_1 = p_id_user
        OR id_user_2 = p_id_user
      );

    RETURN v_connections_count > 0;
  END //

DELIMITER ;

-- VALIDATE LIKES

DELIMITER //

DROP PROCEDURE IF EXISTS validate_likes;

CREATE PROCEDURE validate_likes (IN p_id_connection INT, IN p_id_user INT)
  BEGIN
    IF assert_connection_has_two_likes (p_id_connection, p_id_user) THEN
      SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "The connection must have less than two likes";
    END IF;

    IF NOT assert_connection_has_user (p_id_connection, p_id_user) THEN
      SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "The user must be part of the connection";
    END IF;
  END //

DROP TRIGGER IF EXISTS before_insert_likes;

CREATE TRIGGER before_insert_likes BEFORE INSERT ON likes
  FOR EACH ROW
  BEGIN
    CALL validate_likes (NEW.id_connection, NEW.id_user);
  END //

DROP TRIGGER IF EXISTS before_update_likes;

CREATE TRIGGER before_update_likes BEFORE UPDATE ON likes
  FOR EACH ROW
  BEGIN
    CALL validate_likes (NEW.id_connection, NEW.id_user);
  END //

DELIMITER ;

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

-- VALIDATE MESSAGES

DELIMITER //

DROP PROCEDURE IF EXISTS validate_messages;

CREATE PROCEDURE validate_messages (IN p_id_connection INT, IN p_id_user INT)
  BEGIN
    IF NOT assert_connection_has_two_likes (p_id_connection, p_id_user) THEN
      SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "The connection must have two likes";
    END IF;

    IF NOT assert_connection_has_user (p_id_connection, p_id_user) THEN
      SIGNAL SQLSTATE "45000" SET MESSAGE_TEXT = "The user must be part of the connection";
    END IF;
  END //

DROP TRIGGER IF EXISTS before_insert_messages;

CREATE TRIGGER before_insert_messages BEFORE INSERT ON messages
  FOR EACH ROW
  BEGIN
    CALL validate_messages (NEW.id_connection, NEW.id_user);
  END //

DROP TRIGGER IF EXISTS before_update_messages;

CREATE TRIGGER before_update_messages BEFORE UPDATE ON messages
  FOR EACH ROW
  BEGIN
    CALL validate_messages (NEW.id_connection, NEW.id_user);
  END //

DELIMITER ;

-- INSERT EXAMPLE USERS

INSERT INTO users (
  date,
  email,
  name,
  phone
) VALUES (
  "2525-01-02 13:30:00",
  "alex@example.com",
  "Alex",
  "555-111-1111"
), (
  "2525-01-11 15:00:00",
  "taylor@example.com",
  "Taylor",
  "555-222-2222"
), (
  "2525-01-16 16:30:00",
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
  "2525-01-03 13:30:00"
), (
  @alex_null,
  NULL,
  "2525-01-04 18:00:00"
), (
  @alex_taylor,
  @alex,
  "2525-01-12 13:30:00"
), (
  @alex_taylor,
  @taylor,
  "2525-01-13 15:00:00"
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
  "2525-01-05 18:00:00",
  "[REDACTED]"
), (
  @alex_null,
  @alex,
  "2525-01-07 13:30:00",
  "[REDACTED]"
), (
  @alex_taylor,
  @alex,
  "2525-01-14 13:30:00",
  "[REDACTED]"
);

-- END BULK WRITE OPERATION

SET FOREIGN_KEY_CHECKS = 1;

COMMIT;
