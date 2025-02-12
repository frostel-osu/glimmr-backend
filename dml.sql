-- CREATE CRUD FOR USERS

DELIMITER //

DROP PROCEDURE IF EXISTS create_user;

CREATE PROCEDURE create_user (IN p_email VARCHAR(255), IN p_name VARCHAR(255), IN p_phone VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO users (date, email, phone, name) VALUES (NOW(), p_email, p_name, p_phone);
  END //

DROP PROCEDURE IF EXISTS read_users_by_id;

CREATE PROCEDURE read_users_by_id (IN p_id_user INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM users WHERE id_user = p_id_user;
  END //

DROP PROCEDURE IF EXISTS read_users;

CREATE PROCEDURE read_users ()
  READS SQL DATA
  BEGIN
    SELECT * FROM users;
  END //

DROP PROCEDURE IF EXISTS update_user;

CREATE PROCEDURE update_user (IN p_id_user INT, IN p_email VARCHAR(255), IN p_name VARCHAR(255), IN p_phone VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    UPDATE users SET email = p_email, name = p_name, phone = p_phone WHERE id_user = p_id_user;
  END //

DROP PROCEDURE IF EXISTS delete_user;

CREATE PROCEDURE delete_user (IN p_id_user INT)
  MODIFIES SQL DATA
  BEGIN
    DELETE FROM users WHERE id_user = p_id_user;
  END //

DELIMITER ;

-- CREATE CRUD FOR CONNECTIONS

DELIMITER //

DROP PROCEDURE IF EXISTS create_connection;

CREATE PROCEDURE create_connection (IN p_id_user_1 INT, IN p_id_user_2 INT)
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO connections (id_user_1, id_user_2) VALUES (p_id_user_1, p_id_user_2);
  END //

DROP PROCEDURE IF EXISTS read_connections_by_id;

CREATE PROCEDURE read_connections_by_id (IN p_id_connection INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM connections WHERE id_connection = p_id_connection;
  END //

DROP PROCEDURE IF EXISTS read_connections;

CREATE PROCEDURE read_connections ()
  READS SQL DATA
  BEGIN
    SELECT * FROM connections;
  END //

DROP PROCEDURE IF EXISTS update_connection;

CREATE PROCEDURE update_connection (IN p_id_connection INT, IN p_id_user_1 INT, IN p_id_user_2 INT)
  MODIFIES SQL DATA
  BEGIN
    UPDATE connections SET id_user_1 = p_id_user_1, id_user_2 = p_id_user_2 WHERE id_connection = p_id_connection;
  END //

DROP PROCEDURE IF EXISTS delete_connection;

CREATE PROCEDURE delete_connection (IN p_id_connection INT)
  MODIFIES SQL DATA
  BEGIN
    DELETE FROM connections WHERE id_connection = p_id_connection;
  END //

DELIMITER ;

-- CREATE CRUD FOR LIKES

DELIMITER //

DROP PROCEDURE IF EXISTS create_like;

CREATE PROCEDURE create_like (IN p_id_connection INT, IN p_id_user INT)
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO likes (id_connection, id_user, date) VALUES (p_id_connection, p_id_user, NOW());
  END //

DROP PROCEDURE IF EXISTS read_likes_by_id;

CREATE PROCEDURE read_likes_by_id (IN p_id_like INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM likes WHERE id_like = p_id_like;
  END //

DROP PROCEDURE IF EXISTS read_likes;

CREATE PROCEDURE read_likes ()
  READS SQL DATA
  BEGIN
    SELECT * FROM likes;
  END //

DROP PROCEDURE IF EXISTS update_like;

CREATE PROCEDURE update_like (IN p_id_like INT, IN p_id_connection INT, IN p_id_user INT)
  MODIFIES SQL DATA
  BEGIN
    UPDATE likes SET id_connection = p_id_connection, id_user = p_id_user WHERE id_like = p_id_like;
  END //

DROP PROCEDURE IF EXISTS delete_like;

CREATE PROCEDURE delete_like (IN p_id_like INT)
  MODIFIES SQL DATA
  BEGIN
    DELETE FROM likes WHERE id_like = p_id_like;
  END //

DELIMITER ;

-- CREATE CRUD FOR MESSAGES

DELIMITER //

DROP PROCEDURE IF EXISTS create_message;

CREATE PROCEDURE create_message (IN p_id_connection INT, IN p_id_user INT, IN p_text VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    INSERT INTO messages (id_connection, id_user, date, text) VALUES (p_id_connection, p_id_user, NOW(), p_text);
  END //

DROP PROCEDURE IF EXISTS read_messages_by_id;

CREATE PROCEDURE read_messages_by_id (IN p_id_message INT)
  READS SQL DATA
  BEGIN
    SELECT * FROM messages WHERE id_message = p_id_message;
  END //

DROP PROCEDURE IF EXISTS read_messages;

CREATE PROCEDURE read_messages ()
  READS SQL DATA
  BEGIN
    SELECT * FROM messages;
  END //

DROP PROCEDURE IF EXISTS update_message;

CREATE PROCEDURE update_message (IN p_id_message INT, IN p_id_connection INT, IN p_id_user INT, IN p_text VARCHAR(255))
  MODIFIES SQL DATA
  BEGIN
    UPDATE messages SET id_connection = p_id_connection, id_user = p_id_user, text = p_text WHERE id_message = p_id_message;
  END //

DROP PROCEDURE IF EXISTS delete_message;

CREATE PROCEDURE delete_message (IN p_id_message INT)
  MODIFIES SQL DATA
  BEGIN
    DELETE FROM messages WHERE id_message = p_id_message;
  END //

DELIMITER ;
