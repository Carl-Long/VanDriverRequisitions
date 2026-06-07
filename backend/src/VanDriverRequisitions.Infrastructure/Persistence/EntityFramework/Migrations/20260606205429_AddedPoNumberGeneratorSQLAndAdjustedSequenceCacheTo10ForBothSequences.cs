using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AddedPoNumberGeneratorSQLAndAdjustedSequenceCacheTo10ForBothSequences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateSequence(
                name: "PoNumber");
            
            migrationBuilder.Sql("""
                                     ALTER SEQUENCE [dbo].[FeRequisitionNumber]
                                     CACHE 10;
                                 """);

            migrationBuilder.Sql("""
                                     ALTER SEQUENCE [dbo].[PoNumber]
                                     CACHE 10;
                                 """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                                     ALTER SEQUENCE [dbo].[FeRequisitionNumber]
                                     CACHE 50;
                                 """);
            
            migrationBuilder.DropSequence(
                name: "PoNumber");
        }
    }
}
