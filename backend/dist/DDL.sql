-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema banco_tcc
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema banco_tcc
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `banco_tcc` DEFAULT CHARACTER SET utf8mb3 ;
USE `banco_tcc` ;

-- -----------------------------------------------------
-- Table `banco_tcc`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banco_tcc`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(200) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL,
  `email` VARCHAR(200) NULL DEFAULT NULL,
  `telefone` VARCHAR(200) NULL DEFAULT NULL,
  `senha` VARCHAR(200) NOT NULL,
  `foto_perfil` VARCHAR(200) NULL DEFAULT NULL,
  `admin` TINYINT NOT NULL DEFAULT '0',
  `bio` TEXT NULL DEFAULT NULL,
  `cidade` VARCHAR(100) NULL DEFAULT NULL,
  `estado` VARCHAR(2) NULL DEFAULT NULL,
  `chave_pix` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `cpf_UNIQUE` (`cpf` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 9
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `banco_tcc`.`postagens`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banco_tcc`.`postagens` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `tipo_postagem` ENUM('denuncia', 'adocao', 'comunicado', 'doacao') NOT NULL,
  `prioridade` ENUM('normal', 'alta', 'urgente', 'prioritario', 'relevante') NOT NULL DEFAULT 'normal',
  `prioridade_score` TINYINT UNSIGNED NOT NULL DEFAULT '0' COMMENT 'Pontuação de palavras-chave de urgência detectadas',
  `titulo` VARCHAR(150) NOT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  `raca` VARCHAR(150) NULL DEFAULT NULL,
  `genero` ENUM('Fêmea', 'Macho', 'Macho/Fêmea') NULL DEFAULT NULL,
  `localizacao` VARCHAR(255) NULL DEFAULT NULL,
  `idade` VARCHAR(100) NULL DEFAULT NULL,
  `foto` TEXT NULL DEFAULT NULL,
  `fixado` TINYINT(1) NOT NULL DEFAULT '0',
  `data_criacao` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `usuarios_id` INT NOT NULL,
  `ong_destino_id` INT NULL DEFAULT NULL,
  `valor_doacao` DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Valor em R$ para postagens do tipo doacao',
  PRIMARY KEY (`id`),
  INDEX `fk_postagens_usuarios_idx` (`usuarios_id` ASC) VISIBLE,
  INDEX `fk_postagens_ong_idx` (`ong_destino_id` ASC) VISIBLE,
  CONSTRAINT `fk_postagens_ong`
    FOREIGN KEY (`ong_destino_id`)
    REFERENCES `banco_tcc`.`usuarios` (`id`)
    ON DELETE SET NULL,
  CONSTRAINT `fk_postagens_usuarios`
    FOREIGN KEY (`usuarios_id`)
    REFERENCES `banco_tcc`.`usuarios` (`id`)
    ON DELETE CASCADE)
ENGINE = InnoDB
AUTO_INCREMENT = 51
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `banco_tcc`.`comentarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banco_tcc`.`comentarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `comentario` TEXT NOT NULL,
  `usuarios_id` INT NOT NULL,
  `postagens_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_comentarios_usuarios1_idx` (`usuarios_id` ASC) VISIBLE,
  INDEX `fk_comentarios_postagens1_idx` (`postagens_id` ASC) VISIBLE,
  CONSTRAINT `fk_comentarios_postagens1`
    FOREIGN KEY (`postagens_id`)
    REFERENCES `banco_tcc`.`postagens` (`id`),
  CONSTRAINT `fk_comentarios_usuarios1`
    FOREIGN KEY (`usuarios_id`)
    REFERENCES `banco_tcc`.`usuarios` (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `banco_tcc`.`doacoes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banco_tcc`.`doacoes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuarios_id` INT UNSIGNED NULL DEFAULT NULL COMMENT 'Quem doou (null se anônimo)',
  `ong_id` INT UNSIGNED NOT NULL COMMENT 'ONG que recebe',
  `valor` DECIMAL(10,2) NOT NULL,
  `descricao` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('pendente', 'processando', 'aprovado', 'rejeitado', 'cancelado', 'estornado') NOT NULL DEFAULT 'pendente',
  `mp_payment_id` VARCHAR(64) NULL DEFAULT NULL COMMENT 'ID do payment no MP',
  `qr_code` TEXT NULL DEFAULT NULL COMMENT 'Código copia-e-cola PIX',
  `qr_code_base64` MEDIUMTEXT NULL DEFAULT NULL COMMENT 'Imagem QR em base64',
  `criado_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `aprovado_em` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uq_mp_payment` (`mp_payment_id` ASC) VISIBLE,
  INDEX `idx_ong_status` (`ong_id` ASC, `status` ASC) VISIBLE,
  INDEX `idx_usuario` (`usuarios_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `banco_tcc`.`notificacoes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `banco_tcc`.`notificacoes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ong_id` INT UNSIGNED NOT NULL COMMENT 'ONG que recebe a notificação',
  `postagem_id` INT UNSIGNED NOT NULL COMMENT 'Postagem que gerou a notificação',
  `tipo` VARCHAR(40) NOT NULL COMMENT 'denuncia_urgente | adocao_prioritaria | doacao_relevante | doacao_confirmada',
  `mensagem` TEXT NOT NULL,
  `lida` TINYINT(1) NOT NULL DEFAULT '0',
  `criada_em` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ong_lida` (`ong_id` ASC, `lida` ASC) VISIBLE,
  INDEX `idx_postagem` (`postagem_id` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 4
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_unicode_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
