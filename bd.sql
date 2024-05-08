-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: bd
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `dc` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'luz','luz@correo.com','$2a$05$yETERfU.Bif2ADHt/S9Dv.weAHGAj40HT7i15Tik08skvZ52NLWe6',NULL),(3,'emily','emily@correo.com','$2a$05$42kZ1wtFEhNbqF9yiJyD/OUW4FPZdiBPVcItpUEWgYScWJ6VtXUVW',NULL),(4,'maria','maria@gmail.com','$2a$05$HiFwgtpTMyWsFPE3mr4ho.XHJycBqLeYZ7i8q91Zkf/0nCjrqb3Ri',NULL),(5,'lucia','luci@luci.com','$2a$05$v3/UBw1Ue3oDCFcFIx2EVe2YX2SL0u9Wi3lA6MTvvChAKVAjCZupu','2024-04-07 13:38:58'),(6,'jorge','j@j.com','$2a$05$hiUVkl10nyC/P8E7qCzRYuTXPWnXNYEzLpb6nQ2yu4WQPD7PcxcW6','2024-04-07'),(7,'marly','marly@gmail.com','$2a$05$Dqh.4JfsTzOpNxBITjjwF.YdhQ6fzcFSaRfbf7oeVDoxuvFF0RzNS','2024-04-11'),(8,'edwar','edwar@edwar.com ','$2a$05$Dvm1HpA9w4ZxdDkY.rNPnumPYwvK7xDZkU60gB2Cz2KOAldYlBXfO','2024-04-11'),(9,'iguana','i@i.com','$2a$05$POyadnHfBeM5ee7d6i0ujuBdAwBDOq8AuIx3JG4e2SiBwJAkT9gKu','2024-04-11'),(10,'mirian','mirian@gmail.com','$2a$05$yWnp4svMULXRqABdta7wjOHuIqPFxfqKqE1H4Mz.j6JEaJ9dnEld6','2024-04-11');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-04-11 15:23:06
