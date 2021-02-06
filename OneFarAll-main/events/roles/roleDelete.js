const StateManager = require('../../utils/StateManager');
const BaseEvent = require('../../utils/structures/BaseEvent');
const guildCommandPrefixes = new Map();
var checkBotOwner = require('../../function/check/botOwner');


module.exports = class roleDeleteEvent extends BaseEvent {
	constructor() {
		super('roleDelete');
		this.connection = StateManager.connection;
	}

	async run(client, role) {
		let guild = role.guild;
		if (!role.guild.me.hasPermission("VIEW_AUDIT_LOG")) return client.config.owners.forEach(async (o) => {
			client.users.cache.get(o).send("Je n'ai pas assez de permission pour gerer l'antiraid", {
				action: `ROLE_DELETE`
			})
		})
		const isOnFetched = await this.connection.query(`SELECT roleDelete FROM antiraid WHERE guildId = '${role.guild.id}'`);
		const isOnfetched = isOnFetched[0].roleDelete;
		let isOn;
		if (isOnfetched == "1") { isOn = true };
		if (isOnFetched == "0") { isOn = false };
		let action;
		if (isOn) {
			action = await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" }).then(async (audit) => audit.entries.first());

		} else {
			return;
        }

		if (action.executor.id === client.user.id) return;
		var isOwner = checkBotOwner(action.executor.id);

		const isWlOnFetched = await this.connection.query(`SELECT roleDelete FROM antiraidWlBp WHERE guildId = '${role.guild.id}'`);
		const isWlOnfetched = isWlOnFetched[0].roleDelete;
		let isOnWl;
		if (isWlOnfetched == "1") { isOnWl = true };
		if (isWlOnfetched == "0") { isOnWl = false };

		let isWlFetched = await this.connection.query(`SELECT whitelisted FROM guildConfig WHERE guildId = '${role.guild.id}'`);
		let isWlfetched = isWlFetched[0].whitelisted.toString();
		let isWl1 = isWlfetched.split(",");
		let isWl;
		if (isWl1.includes(action.executor.id)) { isWl = true };
		if (!isWl1.includes(action.executor.id)) { isWl = false };


		if (isOwner == true || guild.ownerID == action.executor.id || isOn == false) {

			console.log("Role update rien fait")
		} else if (isOwner == true || guild.ownerID == action.executor.id || isOn == false || isOnWl == true && isWl == true) {
			console.log("Rien fait 2")

		} else if (isOn == true && isOwner == false || guild.owner.id !== action.executor.id || isOnWl == true && isWl == false || isOnWl == false) {
            let newRole = await role.guild.roles.create({
                data: role
            })
            newRole.setPosition(role.position)

			let after = await this.connection.query(`SELECT roleDelete FROM antiraidconfig WHERE guildId = '${role.guild.id}'`)


			let guild = client.guilds.cache.find(guild => guild.id === role.guild.id);

			if (after[0].roleDelete === 'ban') {
				guild.members.ban(action.executor.id)
			} else if (after[0].roleDelete === 'kick') {
				guild.member(action.executor.id).kick({
                    reason: `OneForAll - Type: roleDelete `
                })
			} else if (after[0].roleDelete === 'unrank') {
				let roles = []
                let role = await guild.member(action.executor.id).roles.cache
                    .map(role => roles.push(role.id))
                role
                guild.members.cache.get(action.executor.id).roles.remove(roles, `OneForAll - Type: roleDelete`)
			}


		}
	}
}

