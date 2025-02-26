-- CREATE CRUD FOR USERS

DROP VIEW IF EXISTS view_users;

CREATE VIEW view_users AS
  SELECT * FROM users
  ORDER BY id_user;

DELIMITER //

DROP PROCEDURE IF EXISTS create_user //

CREATE PROCEDURE create_user(IN p_email VARCHAR(255), IN p_name VARCHAR(255), IN p_phone VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO users (date, email, name, phone) VALUES (NOW(), p_email, p_name, p_phone);

    CALL read_users_by_id(LAST_INSERT_ID());
  END //

DROP PROCEDURE IF EXISTS read_users_by_id //

CREATE PROCEDURE read_users_by_id(IN p_id_user INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM view_users WHERE id_user = p_id_user;
  END //

DROP PROCEDURE IF EXISTS read_users //

CREATE PROCEDURE read_users()
  READS SQL DATA
  BEGIN
    SELECT * FROM view_users;
  END //

DROP PROCEDURE IF EXISTS update_user //

CREATE PROCEDURE update_user(IN p_id_user INT, IN p_email VARCHAR(255), IN p_name VARCHAR(255), IN p_phone VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    UPDATE users SET
      email = IFNULL(p_email, email),
      name = IFNULL(p_name, name),
      phone = IFNULL(p_phone, phone)
      WHERE id_user = p_id_user;

    CALL read_users_by_id(p_id_user);
  END //

DROP PROCEDURE IF EXISTS delete_user //

CREATE PROCEDURE delete_user(IN p_id_user INT)
  MODIFIES SQL DATA
  BEGIN
    DELETE FROM users WHERE id_user = p_id_user;
  END //

DELIMITER ;

-- CREATE CRUD FOR CONNECTIONS

DROP VIEW IF EXISTS view_connections;

CREATE VIEW view_connections AS
  SELECT
    this.*,
    CONCAT(IFNULL(user_1.name, "NULL"), " + ", IFNULL(user_2.name, "NULL")) AS name_connection,
    user_1.name AS name_user_1,
    user_2.name AS name_user_2
  FROM connections AS this
  LEFT JOIN view_users AS user_1 ON this.id_user_1 = user_1.id_user
  LEFT JOIN view_users AS user_2 ON this.id_user_2 = user_2.id_user
  ORDER BY this.id_connection;

DELIMITER //

DROP PROCEDURE IF EXISTS create_connection //

CREATE PROCEDURE create_connection(IN p_id_user_1 INT, IN p_id_user_2 INT)
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO connections (id_user_1, id_user_2) VALUES (p_id_user_1, p_id_user_2);
  END //

DROP PROCEDURE IF EXISTS read_connections_by_id //

CREATE PROCEDURE read_connections_by_id(IN p_id_connection INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM view_connections WHERE id_connection = p_id_connection;
  END //

DROP PROCEDURE IF EXISTS read_connections //

CREATE PROCEDURE read_connections()
  READS SQL DATA
  BEGIN
    SELECT * FROM view_connections;
  END //

DROP PROCEDURE IF EXISTS update_connection //

CREATE PROCEDURE update_connection(IN p_id_connection INT, IN p_id_user_1 INT, IN p_id_user_2 INT)
  MODIFIES SQL DATA
  BEGIN
    UPDATE connections SET id_user_1 = p_id_user_1, id_user_2 = p_id_user_2 WHERE id_connection = p_id_connection;
  END //

DROP PROCEDURE IF EXISTS delete_connection //

CREATE PROCEDURE delete_connection(IN p_id_connection INT)
  MODIFIES SQL DATA
  BEGIN
    DELETE FROM connections WHERE id_connection = p_id_connection;
  END //

DELIMITER ;

-- CREATE CRUD FOR LIKES

DROP VIEW IF EXISTS view_likes;

CREATE VIEW view_likes AS
  SELECT this.*, connection.name_connection, user.name AS name_user
  FROM likes AS this
  JOIN view_connections AS connection ON this.id_connection = connection.id_connection
  LEFT JOIN view_users AS user ON this.id_user = user.id_user
  ORDER BY this.id_like;

DELIMITER //

DROP PROCEDURE IF EXISTS create_like //

CREATE PROCEDURE create_like(IN p_id_connection INT, IN p_id_user INT)
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO likes (id_connection, id_user, date) VALUES (p_id_connection, p_id_user, NOW());
  END //

DROP PROCEDURE IF EXISTS read_likes_by_id //

CREATE PROCEDURE read_likes_by_id(IN p_id_like INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM view_likes WHERE id_like = p_id_like;
  END //

DROP PROCEDURE IF EXISTS read_likes //

CREATE PROCEDURE read_likes()
  READS SQL DATA
  BEGIN
    SELECT * FROM view_likes;
  END //

DELIMITER ;

-- CREATE CRUD FOR MESSAGES

DROP VIEW IF EXISTS view_messages;

CREATE VIEW view_messages AS
  SELECT this.*, connection.name_connection, user.name AS name_user
  FROM messages AS this
  JOIN view_connections AS connection ON this.id_connection = connection.id_connection
  LEFT JOIN view_users AS user ON this.id_user = user.id_user
  ORDER BY this.id_message;

DELIMITER //

DROP PROCEDURE IF EXISTS create_message //

CREATE PROCEDURE create_message(IN p_id_connection INT, IN p_id_user INT, IN p_text VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO messages (id_connection, id_user, date, text) VALUES (p_id_connection, p_id_user, NOW(), p_text);
  END //

DROP PROCEDURE IF EXISTS read_messages_by_id //

CREATE PROCEDURE read_messages_by_id(IN p_id_message INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM view_messages WHERE id_message = p_id_message;
  END //

DROP PROCEDURE IF EXISTS read_messages //

CREATE PROCEDURE read_messages()
  READS SQL DATA
  BEGIN
    SELECT * FROM view_messages;
  END //

DELIMITER ;
