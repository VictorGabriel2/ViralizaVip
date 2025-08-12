const { ButtonBuilder } = require('@discordjs/builders');
const client = require('../../index');
const colors = require('colors');
const discordTranscripts = require('discord-html-transcripts');
const {
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonStyle
} = require('discord.js');

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.values[0] === "gerar_transcript") {
        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('optionsticket')
                    .setPlaceholder('Funçoes do ticket!')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("❌ㆍEncerrar")
                            .setDescription("Encerre o atendimento.")
                            .setValue("encerrar_atendimento"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("📜ㆍGerar transcript")
                            .setDescription("Gere um transcript de todo o atendimento.")
                            .setValue("gerar_transcript"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("📞ㆍAssumir ticket")
                            .setDescription("Assuma o ticket para atende-lo.")
                            .setValue("assumir_ticket"),
                    )
            );

        interaction.update({ components: [menu] }).then(async () => {
            if (!interaction.member.roles.cache.has(`${process.env.STAFF}`)) {
                interaction.followUp({
                    embeds: [new EmbedBuilder()
                        .setDescription(`___**${interaction.user} você não possui permissão!**___`)
                        .setColor(0xFF0000)
                    ],
                    ephemeral: true
                });
                return;
            }

            interaction.followUp({
                embeds: [new EmbedBuilder()
                    .setDescription(`_**Transcript do atendimento gerado com sucesso!**_`)
                    .setColor(0x00FF00)
                    .setTimestamp()
                ]
            }).then(async () => {
                const attachment = await discordTranscripts.createTranscript(interaction.channel, {
                    fileName: `${interaction.channel.name}.html`,
                });

                const embed = new EmbedBuilder()
                    .setDescription("_**Clique para baixar as log's do atendimento!**_")
                    .setColor(0x313338);

                const channelTopic = interaction.channel.topic;
                const pattern = /-(\d+)/;
                const match = pattern.exec(channelTopic);
                const userId = match ? match[1] : null;
                let atendente;

                const message = await interaction.channel.messages.fetch(interaction.message.id);
                if (message.embeds.length > 0) {
                    for (const embed of message.embeds) {
                        if (embed.fields && embed.fields.length > 0) {
                            for (const field of embed.fields) {
                                if (field.name === "**Atendente:**") {
                                    const atendenteUsername = field.value.replace(/`/g, '');
                                    const atendenteMember = interaction.guild.members.cache.find(member => member.user.username === atendenteUsername);
                                    atendente = atendenteMember ? atendenteMember.user.id : null;
                                }
                            }
                        }
                    }
                }

                try {
                    await client.channels.cache.get(process.env.LOGS).send({
                        embeds: [embed],
                        files: [attachment]
                    });
                } catch (err) {
                    console.log(colors.red(`❌ Falha ao enviar transcript para o canal de logs: ${err.message}`));
                }

                try {
                    const member = await interaction.guild.members.fetch(userId);
                    const user = member.user;
                    await user.send({ embeds: [embed], files: [attachment] });
                } catch (err) {
                    console.log(colors.red(`❌ Falha ao enviar transcript para o usuário: ${err.message}`));
                    interaction.channel.send({
                        content: `⚠️ ${interaction.user}, não consegui te enviar a transcript por DM. Verifique se suas DMs estão abertas.`
                    }).catch(() => {});
                }

                try {
                    const atendenteUser = await client.users.fetch(atendente);
                    await atendenteUser.send({ embeds: [embed], files: [attachment] });
                } catch (err) {
                    console.log(colors.red(`❌ Falha ao enviar transcript para o atendente: ${err.message}`));
                    interaction.channel.send({
                        content: `⚠️ Não consegui enviar a transcript para o atendente.`
                    }).catch(() => {});
                }
            });
        });
    }
});
