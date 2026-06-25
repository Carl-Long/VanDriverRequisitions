using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class SetStdNextRequisitionNumberSequenceCacheTo10 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                 ALTER SEQUENCE [dbo].[StdRequisitionNumber]
                                 CACHE 10;
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                 ALTER SEQUENCE [dbo].[StdRequisitionNumber]
                                 CACHE 50;
                                 """);
        }
    }
}
