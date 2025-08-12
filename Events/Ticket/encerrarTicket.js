const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");

module.exports = {
    name: "close",
    description: "Fecha um ticket.",
    run: async (client, interaction) => {
        if (!interaction.channel.name.includes("ticket-")) {
            return interaction.reply({ content: "Este comando só pode ser usado em tickets!", ephemeral: true });
        }

        const member = interaction.guild.members.cache.get(interaction.channel.name.split("ticket-")[1]);

        if (!member) {
            return interaction.reply({ content: "Usuário não encontrado!", ephemeral: true });
        }

        await interaction.reply({ content: `🔒 Fechando o ticket...` });

        const transcript = await discordTranscripts.createTranscript(interaction.channel, {
            limit: -1,
            returnType: "buffer",
            filename: `transcript-${interaction.channel.name}.html`,
        });

        const attachment = new AttachmentBuilder(transcript, {
            name: `transcript-${interaction.channel.name}.html`,
        });

        // Envia para o canal de logs
        const logsChannel = interaction.guild.channels.cache.find(c => c.name === "logs");
        if (logsChannel) {
            const embed = new EmbedBuilder()
                .setTitle("📁 Ticket fechado")
                .setDescription(`O ticket de ${member} foi fechado.`)
                .setColor("Red")
                .setTimestamp();

            await logsChannel.send({ embeds: [embed], files: [attachment] });
        }

        // Envia para o usuário
        try {
            const embedUser = new EmbedBuilder()
                .setTitle("Seu ticket foi fechado")
                .setDescription("Segue o transcript do seu ticket em anexo.")
                .setColor("Blue");

            await member.send({ embeds: [embedUser], files: [attachment] });
        } catch (e) {
            console.log(`Não foi possível enviar DM para ${member.user.tag}`);
        }

        setTimeout(() => {
            interaction.channel.delete().catch(console.error);
        }, 5000);
    },
};
