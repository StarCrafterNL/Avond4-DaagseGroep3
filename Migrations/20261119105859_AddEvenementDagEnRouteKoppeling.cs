using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Avond4_DaagseGroep3.Migrations
{
    /// <inheritdoc />
    public partial class AddEvenementDagEnRouteKoppeling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EvenementDagId",
                table: "Routes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EvenementDag",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DagNummer = table.Column<int>(type: "int", nullable: false),
                    Datum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EvenementId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvenementDag", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvenementDag_Evenementen_EvenementId",
                        column: x => x.EvenementId,
                        principalTable: "Evenementen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Routes_EvenementDagId",
                table: "Routes",
                column: "EvenementDagId");

            migrationBuilder.CreateIndex(
                name: "IX_EvenementDag_EvenementId",
                table: "EvenementDag",
                column: "EvenementId");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_EvenementDag_EvenementDagId",
                table: "Routes",
                column: "EvenementDagId",
                principalTable: "EvenementDag",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_EvenementDag_EvenementDagId",
                table: "Routes");

            migrationBuilder.DropTable(
                name: "EvenementDag");

            migrationBuilder.DropIndex(
                name: "IX_Routes_EvenementDagId",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "EvenementDagId",
                table: "Routes");
        }
    }
}
