import { displayFullName } from "@/lib/display-fullname";
import { displayRole } from "@/lib/display-role";
import type { CreatedUser } from "@/types/user.type";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";

const userColumnHelper = createColumnHelper<CreatedUser>();

export interface UserColumnOptions {
    onViewDetail?: (email: string) => void;
}

export function getUserColumns(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: UserColumnOptions = {}
): ColumnDef<CreatedUser, never>[] {
    return [
        userColumnHelper.accessor('email', {
            header: 'Email',
            cell: (info) => {
                return (
                    <div className="max-w-50">
                        {info.getValue()}
                    </div>
                );
            },
            enableSorting: true, 
        }),

        userColumnHelper.accessor('fullName', {
            header: 'Nama Lengkap',
            cell: (info) => {
                return (
                    <div className="max-w-50">
                        {displayFullName(info.getValue())}
                    </div>
                );
            },
            enableSorting: true, 
        }),

        userColumnHelper.accessor('phoneNumber', {
            header: 'Nomor Handphone',
            cell: (info) => {
                return (
                    <div className="max-w-50">
                        {info.getValue() ?? '-'}
                    </div>
                );
            },
            enableSorting: false, 
        }),

        userColumnHelper.accessor('role', {
            header: 'Role',
            cell: (info) => {
                return (
                    <div className="max-w-50">
                        {displayRole(info.getValue())}
                    </div>
                );
            },
            enableSorting: false, 
        }),

        userColumnHelper.accessor('status', {
            header: 'Status',
            cell: (info) => {
                return (
                    <div className="max-w-50 capitalize">
                        {info.getValue()}
                    </div>
                );
            },
            enableSorting: false, 
        }),
    ]
}