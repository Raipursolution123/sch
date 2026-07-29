from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.fees.api.views.common import MODULE, fee_error_response
from apps.fees.models.fee_groups import FeeGroups
from apps.fees.models.fee_groups_feetype import FeeGroupsFeetype
from apps.fees.models.feemasters import Feemasters
from apps.fees.models.feetype import Feetype
from common.responses.api import APIResponse

CATEGORY = "fees"


class FeeMasterListView(APIView):
    permission_classes = [IsAuthenticated]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def get(self, request):
        try:
            groups = {}
            try:
                groups = {
                    g.id: g.name for g in FeeGroups.objects.all() if g.id is not None
                }
            except Exception:
                groups = {}

            types = {}
            try:
                types = {
                    t.id: t.type for t in Feetype.objects.all() if t.id is not None
                }
            except Exception:
                types = {}

            results = []

            # Map descriptions from Feemasters and Feetype
            fm_desc_by_id = {}
            fm_desc_by_combo = {}
            ft_desc_by_id = {
                t.id: t.description
                for t in Feetype.objects.all()
                if t.id and t.description
            }
            try:
                for m in Feemasters.objects.all():
                    if m.description:
                        fm_desc_by_id[m.id] = m.description
                        if m.class_id and m.feetype_id:
                            fm_desc_by_combo[(m.class_id, m.feetype_id)] = m.description
            except Exception:
                pass

            # Build list from FeeGroupsFeetype (which is the source of primary IDs in UI)
            try:
                for fgft in FeeGroupsFeetype.objects.all().order_by("-id"):
                    fg_id = fgft.fee_groups_id
                    ft_id = fgft.feetype_id
                    desc = (
                        fm_desc_by_id.get(fgft.id)
                        or fm_desc_by_combo.get((fg_id, ft_id))
                        or ft_desc_by_id.get(ft_id)
                        or (f"Due Date: {fgft.due_date}" if fgft.due_date else "")
                    )
                    results.append(
                        {
                            "id": fgft.id,
                            "fee_group_id": fg_id,
                            "fee_group_name": (
                                groups.get(fg_id, f"Group #{fg_id}")
                                if fg_id
                                else "Default Group"
                            ),
                            "fee_type_id": ft_id,
                            "fee_type_name": (
                                types.get(ft_id, f"Type #{ft_id}")
                                if ft_id
                                else "General Fee"
                            ),
                            "amount": float(fgft.amount or 0.0),
                            "description": desc,
                            "is_active": fgft.is_active or "yes",
                        }
                    )
            except Exception:
                pass

            # Also add any standalone Feemasters rows not present in FeeGroupsFeetype
            try:
                existing_combos = {
                    (r["fee_group_id"], r["fee_type_id"]) for r in results
                }
                for m in Feemasters.objects.all().order_by("-id"):
                    combo = (m.class_id, m.feetype_id)
                    if combo in existing_combos:
                        continue
                    existing_combos.add(combo)
                    results.append(
                        {
                            "id": m.id,
                            "fee_group_id": m.class_id,
                            "fee_group_name": (
                                groups.get(m.class_id, f"Group #{m.class_id}")
                                if m.class_id
                                else "Default Group"
                            ),
                            "fee_type_id": m.feetype_id,
                            "fee_type_name": (
                                types.get(m.feetype_id, f"Type #{m.feetype_id}")
                                if m.feetype_id
                                else "General Fee"
                            ),
                            "amount": float(m.amount or 0.0),
                            "description": m.description or "",
                            "is_active": m.is_active or "yes",
                        }
                    )
            except Exception:
                pass

            return APIResponse.success(
                data={"results": results, "count": len(results)},
                message="Fee masters retrieved successfully.",
            )
        except Exception as exc:
            return fee_error_response(exc)

    def post(self, request):
        try:
            fee_group_id = request.data.get("fee_group_id")
            fee_type_id = request.data.get("fee_type_id")
            amount = float(request.data.get("amount") or 0.0)
            description = request.data.get("description", "")

            # 1. Create in FeeGroupsFeetype
            fgft = FeeGroupsFeetype.objects.create(
                fee_groups_id=fee_group_id,
                feetype_id=fee_type_id,
                amount=amount,
                collection_type=1,
                is_active="yes",
                created_at=timezone.now(),
            )

            # 2. Update description on Feetype if feetype_id provided
            if fee_type_id and description:
                try:
                    ft = Feetype.objects.filter(id=fee_type_id).first()
                    if ft:
                        ft.description = description
                        ft.save()
                except Exception:
                    pass

            # 3. Create in Feemasters
            try:
                Feemasters.objects.create(
                    id=fgft.id,
                    class_id=fee_group_id,
                    feetype_id=fee_type_id,
                    amount=amount,
                    description=description,
                    is_active="yes",
                    created_at=timezone.now(),
                )
            except Exception:
                try:
                    Feemasters.objects.create(
                        class_id=fee_group_id,
                        feetype_id=fee_type_id,
                        amount=amount,
                        description=description,
                        is_active="yes",
                        created_at=timezone.now(),
                    )
                except Exception:
                    pass

            return APIResponse.success(
                data={"id": fgft.id},
                message="Fee master rule created successfully.",
                status_code=status.HTTP_201_CREATED,
            )
        except Exception as exc:
            return fee_error_response(exc)


class FeeMasterDetailView(APIView):
    permission_classes = [IsAuthenticated]
    legacy_module_short_code = MODULE
    legacy_permission_category = CATEGORY

    def put(self, request, pk):
        try:
            fee_group_id = request.data.get("fee_group_id")
            fee_type_id = request.data.get("fee_type_id")
            amount = (
                float(request.data.get("amount") or 0.0)
                if "amount" in request.data
                else None
            )
            description = request.data.get("description", "")

            fgft = FeeGroupsFeetype.objects.filter(pk=pk).first()
            if fgft:
                if fee_group_id is not None:
                    fgft.fee_groups_id = fee_group_id
                if fee_type_id is not None:
                    fgft.feetype_id = fee_type_id
                if amount is not None:
                    fgft.amount = amount
                fgft.save()

            target_fg = fee_group_id or (fgft.fee_groups_id if fgft else None)
            target_ft = fee_type_id or (fgft.feetype_id if fgft else None)

            # Sync description to Feemasters table
            fm = Feemasters.objects.filter(pk=pk).first()
            if not fm and target_fg and target_ft:
                fm = Feemasters.objects.filter(
                    class_id=target_fg, feetype_id=target_ft
                ).first()

            if fm:
                if target_fg is not None:
                    fm.class_id = target_fg
                if target_ft is not None:
                    fm.feetype_id = target_ft
                if amount is not None:
                    fm.amount = amount
                fm.description = description
                fm.save()
            elif target_fg and target_ft:
                try:
                    Feemasters.objects.create(
                        class_id=target_fg,
                        feetype_id=target_ft,
                        amount=amount or 0.0,
                        description=description or "",
                        is_active="yes",
                        created_at=timezone.now(),
                    )
                except Exception:
                    pass

            # Sync description to Feetype table as well
            if target_ft and description:
                try:
                    ft = Feetype.objects.filter(id=target_ft).first()
                    if ft:
                        ft.description = description
                        ft.save()
                except Exception:
                    pass

            return APIResponse.success(message="Fee master rule updated successfully.")
        except Exception as exc:
            return fee_error_response(exc)

    def delete(self, request, pk):
        try:
            fm = Feemasters.objects.filter(pk=pk).first()
            if fm:
                fm.delete()

            fgft = FeeGroupsFeetype.objects.filter(pk=pk).first()
            if fgft:
                fgft.delete()

            return APIResponse.success(message="Fee master rule deleted successfully.")
        except Exception as exc:
            return fee_error_response(exc)
