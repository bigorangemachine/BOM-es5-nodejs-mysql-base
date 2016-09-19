

CREATE TABLE `JIRAGIT-team`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`teamname` CHAR(255) NOT NULL,
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-ticket_prefix_index`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`team_id` bigint(20) unsigned NOT NULL,
	`ticket_prefix` CHAR(6) NOT NULL,
	INDEX `team_id` (`team_id`),
    FULLTEXT `ticket_prefix` (`ticket_prefix`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-statuses`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`status` CHAR(255) NOT NULL,
    FULLTEXT `status` (`status`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-tickets`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`ticket_prefix_id` bigint(20) unsigned NOT NULL,
	`ticket_id` bigint(20) unsigned NOT NULL,
	`status_id` bigint(20) unsigned NOT NULL,
	`date_created` DATETIME NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
	`date_modified` DATETIME NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
	INDEX `ticket_prefix_id` (`ticket_prefix_id`),
	INDEX `ticket_id` (`ticket_id`),
	INDEX `status_id` (`status_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-modules`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`module` CHAR(255) NOT NULL,
    FULLTEXT `module` (`module`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-repos`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`repo` CHAR(255) NOT NULL,
    FULLTEXT `repo` (`repo`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-repo_module_index`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`repo_id` bigint(20) unsigned NOT NULL,
	`module_id` bigint(20) unsigned NOT NULL,
	INDEX `repo_id` (`repo_id`),
	INDEX `module_id` (`module_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;


CREATE TABLE `JIRAGIT-repo_ticket_index`(
	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
	`ticket_id` bigint(20) unsigned NOT NULL,
	`repo_module_index_id` bigint(20) unsigned NOT NULL,
	INDEX `ticket_id` (`ticket_id`),
	INDEX `repo_module_index_id` (`repo_module_index_id`),
	PRIMARY KEY (`id`),
	UNIQUE KEY `id` (`id`)
)ENGINE = MyISAM;



-- CREATE TABLE `JIRAGIT-tickets`(
-- 	`id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
-- 	`issue_prefix` CHAR(4) NOT NULL,
-- 	`date_modified` DATETIME NOT NULL DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
-- 	FULLTEXT `response_code` (`response_code`),
-- 	PRIMARY KEY (`id`),
-- 	UNIQUE KEY `id` (`id`)
-- )ENGINE = MyISAM;
