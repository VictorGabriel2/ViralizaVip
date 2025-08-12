const {Client, GatewayIntentBits, Partials} = require('discord.js');
const Discord = require("discord.js");
const fs = require('fs');
require('dotenv').config();


const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});



module.exports = client

client.on('interactionCreate', async (interaction) => {
	if (interaction.type === Discord.InteractionType.ApplicationCommand) {

		const cmd = client.slashCommands.get(interaction.commandName);
		if (!cmd) return interaction.reply(`Error`);
		interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);
		cmd.run(client, interaction)
	}
})

client.slashCommands = new Discord.Collection()

fs.readdirSync('./Handlers').forEach((handler) => {
	require(`./Handlers/${handler}`)(client)
});


client.login(process.env.TOKEN);
