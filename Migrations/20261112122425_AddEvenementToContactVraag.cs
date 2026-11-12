using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Avond4_DaagseGroep3.Migrations
{
    /// <inheritdoc />
    public partial class AddEvenementToContactVraag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EvenementId",
                table: "ContactVragen",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ContactVragen_EvenementId",
                table: "ContactVragen",
                column: "EvenementId");

            migrationBuilder.AddForeignKey(
                name: "FK_ContactVragen_Evenementen_EvenementId",
                table: "ContactVragen",
                column: "EvenementId",
                principalTable: "Evenementen",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContactVragen_Evenementen_EvenementId",
                table: "ContactVragen");

            migrationBuilder.DropIndex(
                name: "IX_ContactVragen_EvenementId",
                table: "ContactVragen");

            migrationBuilder.DropColumn(
                name: "EvenementId",
                table: "ContactVragen");
        }
    }
}
