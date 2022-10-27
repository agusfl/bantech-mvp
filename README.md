SELECT link_id 
FROM bank_link
INNER JOIN user ON bank_link.user_id = user.id;

SELECT link_id 
FROM bank_link
INNER JOIN user ON bank_link.user_id = user.id
WHERE link_id = '40f82878-dae4-4253-b585-4b4f36efa946';

DELETE link_id 
FROM bank_link
INNER JOIN user ON bank_link.user_id = user.id
WHERE link_id = '40f82878-dae4-4253-b585-4b4f36efa946';


