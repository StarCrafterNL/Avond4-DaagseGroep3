using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Avond4_DaagseGroep3.Migrations
{
    /// <inheritdoc />
    public partial class FixEvenementDagEnRouteKoppeling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EvenementDag_Evenementen_EvenementId",
                table: "EvenementDag");

            migrationBuilder.DropForeignKey(
                name: "FK_Routes_EvenementDag_EvenementDagId",
                table: "Routes");

            migrationBuilder.DropIndex(
                name: "IX_Routes_EvenementDagId",
                table: "Routes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EvenementDag",
                table: "EvenementDag");

            migrationBuilder.DropColumn(
                name: "EvenementDagId",
                table: "Routes");

            migrationBuilder.RenameTable(
                name: "EvenementDag",
                newName: "EvenementDagen");

            migrationBuilder.RenameIndex(
                name: "IX_EvenementDag_EvenementId",
                table: "EvenementDagen",
                newName: "IX_EvenementDagen_EvenementId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_EvenementDagen",
                table: "EvenementDagen",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "EvenementDagRoute",
                columns: table => new
                {
                    EvenementDagenId = table.Column<int>(type: "int", nullable: false),
                    RoutesId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvenementDagRoute", x => new { x.EvenementDagenId, x.RoutesId });
                    table.ForeignKey(
                        name: "FK_EvenementDagRoute_EvenementDagen_EvenementDagenId",
                        column: x => x.EvenementDagenId,
                        principalTable: "EvenementDagen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EvenementDagRoute_Routes_RoutesId",
                        column: x => x.RoutesId,
                        principalTable: "Routes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EvenementDagRoute_RoutesId",
                table: "EvenementDagRoute",
                column: "RoutesId");

            migrationBuilder.AddForeignKey(
                name: "FK_EvenementDagen_Evenementen_EvenementId",
                table: "EvenementDagen",
                column: "EvenementId",
                principalTable: "Evenementen",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EvenementDagen_Evenementen_EvenementId",
                table: "EvenementDagen");

            migrationBuilder.DropTable(
                name: "EvenementDagRoute");

            migrationBuilder.DropPrimaryKey(
                name: "PK_EvenementDagen",
                table: "EvenementDagen");

            migrationBuilder.RenameTable(
                name: "EvenementDagen",
                newName: "EvenementDag");

            migrationBuilder.RenameIndex(
                name: "IX_EvenementDagen_EvenementId",
                table: "EvenementDag",
                newName: "IX_EvenementDag_EvenementId");

            migrationBuilder.AddColumn<int>(
                name: "EvenementDagId",
                table: "Routes",
                type: "int",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_EvenementDag",
                table: "EvenementDag",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Routes_EvenementDagId",
                table: "Routes",
                column: "EvenementDagId");

            migrationBuilder.AddForeignKey(
                name: "FK_EvenementDag_Evenementen_EvenementId",
                table: "EvenementDag",
                column: "EvenementId",
                principalTable: "Evenementen",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_EvenementDag_EvenementDagId",
                table: "Routes",
                column: "EvenementDagId",
                principalTable: "EvenementDag",
                principalColumn: "Id");
        }
    }
}
